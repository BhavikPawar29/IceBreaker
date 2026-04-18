const GOOGLE_OAUTH_SCOPE = "https://www.googleapis.com/auth/datastore";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1";
const FIRESTORE_DATABASE = "(default)";
const accessTokenCache = {
  expiresAt: 0,
  token: null,
};

export default {
  async fetch(request, env, ctx) {
    void ctx;
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        ok: true,
        service: "sketchline-promotion-worker",
      });
    }

    if (url.pathname === "/promote" && request.method === "POST") {
      const result = await promoteEligibleLines(env, ctx);
      return Response.json(result);
    }

    return Response.json({
      ok: true,
      message: "Use /health or rely on the scheduled cron trigger.",
    });
  },

  async scheduled(controller, env, ctx) {
    void controller;
    ctx.waitUntil(promoteEligibleLines(env, ctx));
  },
};

async function promoteEligibleLines(env) {
  const threshold = Number(env.PROMOTION_THRESHOLD || 50);
  const accessToken = await getGoogleAccessToken(env);
  const candidates = await fetchEligibleCandidates(env, accessToken, threshold);
  const promoted = [];
  const skipped = [];

  for (const candidate of candidates) {
    try {
      const result = await promoteCandidate(env, accessToken, candidate);

      if (result.promoted) {
        promoted.push(candidate.id);
      } else {
        skipped.push({ id: candidate.id, reason: result.reason });
      }
    } catch (error) {
      skipped.push({
        id: candidate.id,
        reason: error.message || "Promotion failed.",
      });
    }
  }

  return {
    candidateCount: candidates.length,
    promoted,
    skipped,
    threshold,
  };
}

async function fetchEligibleCandidates(env, accessToken, threshold) {
  const parent = firestoreDocumentsRoot(env);
  const response = await googleFetch(
    `${FIRESTORE_BASE_URL}/${parent}:runQuery`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "candidate_lines" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                fieldFilter("status", "EQUAL", { stringValue: "candidate" }),
                fieldFilter("score", "GREATER_THAN_OR_EQUAL", {
                  integerValue: String(threshold),
                }),
              ],
            },
          },
          orderBy: [
            {
              field: { fieldPath: "score" },
              direction: "DESCENDING",
            },
          ],
        },
      }),
    },
  );
  const payload = await response.json();

  return payload
    .filter((entry) => entry.document)
    .map((entry) => {
      const document = deserializeDocument(entry.document);

      return {
        id: document.id,
        name: document.name,
        ...document.fields,
      };
    });
}

async function promoteCandidate(env, accessToken, candidate) {
  const approvedDocId = candidate.id;
  const approvedPath = `${firestoreDocumentsRoot(env)}/approved_lines/${approvedDocId}`;
  const approvedExists = await fetchDocumentIfExists(approvedPath, accessToken);
  const promotedAt = Date.now();

  if (approvedExists) {
    await commitWrites(env, accessToken, [
      updateWrite(
        `${firestoreDocumentsRoot(env)}/candidate_lines/${candidate.id}`,
        {
          approvedLineId: approvedDocId,
          promotedAt,
          status: "promoted",
          updatedAt: promotedAt,
        },
        ["approvedLineId", "promotedAt", "status", "updatedAt"],
      ),
      updateWrite(
        `${firestoreDocumentsRoot(env)}/line_fingerprints/${candidate.fingerprint}`,
        {
          approvedLineId: approvedDocId,
          latestLineId: candidate.id,
          normalizedText: candidate.normalizedText,
        },
        ["approvedLineId", "latestLineId", "normalizedText"],
      ),
    ]);

    return {
      promoted: false,
      reason: "Approved document already existed. Candidate metadata repaired.",
    };
  }

  await commitWrites(env, accessToken, [
    createWrite(approvedPath, {
      sourceLineId: candidate.id,
      text: candidate.text,
      normalizedText: candidate.normalizedText,
      fingerprint: candidate.fingerprint,
      createdByUid: candidate.createdByUid,
      createdByName: candidate.createdByName,
      category: candidate.category,
      promotionScore: candidate.score,
      promotedAt,
    }),
    updateWrite(
      `${firestoreDocumentsRoot(env)}/candidate_lines/${candidate.id}`,
      {
        approvedLineId: approvedDocId,
        promotedAt,
        status: "promoted",
        updatedAt: promotedAt,
      },
      ["approvedLineId", "promotedAt", "status", "updatedAt"],
    ),
    updateWrite(
      `${firestoreDocumentsRoot(env)}/line_fingerprints/${candidate.fingerprint}`,
      {
        approvedLineId: approvedDocId,
        latestLineId: candidate.id,
        normalizedText: candidate.normalizedText,
      },
      ["approvedLineId", "latestLineId", "normalizedText"],
    ),
  ]);

  return {
    promoted: true,
    reason: "",
  };
}

function firestoreDocumentsRoot(env) {
  return `projects/${env.GOOGLE_FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE}/documents`;
}

function firestoreDatabaseRoot(env) {
  return `projects/${env.GOOGLE_FIRESTORE_PROJECT_ID}/databases/${FIRESTORE_DATABASE}`;
}

function fieldFilter(fieldPath, op, value) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op,
      value,
    },
  };
}

function createWrite(name, fields) {
  return {
    update: {
      name,
      fields: serializeFields(fields),
    },
    currentDocument: {
      exists: false,
    },
  };
}

function updateWrite(name, fields, fieldPaths) {
  return {
    update: {
      name,
      fields: serializeFields(fields),
    },
    updateMask: {
      fieldPaths,
    },
  };
}

async function commitWrites(env, accessToken, writes) {
  await googleFetch(
    `${FIRESTORE_BASE_URL}/${firestoreDatabaseRoot(env)}/documents:commit`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ writes }),
    },
  );
}

async function fetchDocumentIfExists(documentPath, accessToken) {
  const response = await fetch(`${FIRESTORE_BASE_URL}/${documentPath}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function googleFetch(url, accessToken, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response;
}

async function getGoogleAccessToken(env) {
  if (accessTokenCache.token && Date.now() < accessTokenCache.expiresAt) {
    return accessTokenCache.token;
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = await createSignedJwt(env, now);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = await response.json();
  accessTokenCache.token = payload.access_token;
  accessTokenCache.expiresAt = Date.now() + (payload.expires_in - 60) * 1000;

  return payload.access_token;
}

async function createSignedJwt(env, now) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    sub: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    aud: GOOGLE_TOKEN_URL,
    scope: GOOGLE_OAUTH_SCOPE,
    iat: now,
    exp: now + 3600,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function pemToArrayBuffer(pem) {
  const normalizedPem = pem.replace(/\\n/g, "\n");
  const base64 = normalizedPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function base64UrlEncode(value) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function serializeFields(value) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, serializeValue(entry)]),
  );
}

function serializeValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return { integerValue: String(value) };
    }

    return { doubleValue: value };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((entry) => serializeValue(entry)),
      },
    };
  }

  return {
    mapValue: {
      fields: serializeFields(value),
    },
  };
}

function deserializeDocument(document) {
  return {
    id: document.name.split("/").pop(),
    name: document.name,
    fields: deserializeFields(document.fields || {}),
  };
}

function deserializeFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      deserializeValue(value),
    ]),
  );
}

function deserializeValue(value) {
  if ("stringValue" in value) {
    return value.stringValue;
  }

  if ("integerValue" in value) {
    return Number(value.integerValue);
  }

  if ("doubleValue" in value) {
    return value.doubleValue;
  }

  if ("booleanValue" in value) {
    return value.booleanValue;
  }

  if ("nullValue" in value) {
    return null;
  }

  if ("arrayValue" in value) {
    return (value.arrayValue.values || []).map((entry) =>
      deserializeValue(entry),
    );
  }

  if ("mapValue" in value) {
    return deserializeFields(value.mapValue.fields || {});
  }

  return null;
}
