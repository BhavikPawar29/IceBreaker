import process from "node:process";
import { log } from "node:console";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  "icebreaker-70b95";
const APPLY = process.argv.includes("--apply");
const LIMIT = Number(
  process.env.MIGRATION_LIMIT ||
    process.argv
      .find((argument) => argument.startsWith("--limit="))
      ?.split("=")[1] ||
    500,
);

const CATEGORY_TO_PACK = {
  curious: "deep",
  deeper: "deep",
  playful: "playful",
  storytime: "deep",
  unexpected: "playful",
};

function getServiceAccount() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!rawJson) {
    return null;
  }

  return JSON.parse(rawJson);
}

function inferSituation(text) {
  const normalized = text.toLowerCase();

  if (
    /\b(date|dating|romantic|attractive|green flag|red flag)\b/.test(normalized)
  ) {
    return "date";
  }

  if (/\b(crush|compliment|charm|notice|mood)\b/.test(normalized)) {
    return "crush";
  }

  if (/\b(group|everyone|chat|vote|people here)\b/.test(normalized)) {
    return "group-chat";
  }

  if (/\b(friend|friends|new people|meet)\b/.test(normalized)) {
    return "new-friends";
  }

  return "any";
}

function buildLivePatch(line) {
  const patch = {
    pack: line.pack || CATEGORY_TO_PACK[line.category] || "playful",
    situation: line.situation || inferSituation(line.text || ""),
    updatedAt: Date.now(),
  };

  if ("followUps" in line) {
    patch.followUps = FieldValue.delete();
  }

  return patch;
}

function patchChangesLine(line, patch) {
  return (
    line.situation !== patch.situation ||
    line.pack !== patch.pack ||
    "followUps" in line
  );
}

const serviceAccount = getServiceAccount();

if (!getApps().length) {
  initializeApp(
    serviceAccount
      ? {
          credential: cert(serviceAccount),
          projectId: PROJECT_ID,
        }
      : {
          projectId: PROJECT_ID,
        },
  );
}

const db = getFirestore();

try {
  const snapshot = await db
    .collection("lines")
    .where("status", "==", "approved")
    .limit(LIMIT)
    .get();

  const updates = [];

  snapshot.docs.forEach((documentSnapshot) => {
    const line = {
      id: documentSnapshot.id,
      ...documentSnapshot.data(),
    };
    const patch = buildLivePatch(line);

    if (patchChangesLine(line, patch)) {
      updates.push({
        id: documentSnapshot.id,
        patch,
        ref: documentSnapshot.ref,
        text: line.text,
      });
    }
  });

  log(
    JSON.stringify(
      {
        apply: APPLY,
        checked: snapshot.size,
        projectId: PROJECT_ID,
        toUpdate: updates.length,
        preview: updates.slice(0, 10).map((update) => ({
          id: update.id,
          patch: {
            ...update.patch,
            ...("followUps" in update.patch
              ? { followUps: "[deleteField]" }
              : {}),
          },
          text: update.text,
        })),
      },
      null,
      2,
    ),
  );

  if (!APPLY || !updates.length) {
    process.exit(0);
  }

  let batch = db.batch();
  let batchCount = 0;
  let written = 0;

  for (const update of updates) {
    batch.update(update.ref, update.patch);
    batchCount += 1;
    written += 1;

    if (batchCount === 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  log(JSON.stringify({ written }, null, 2));
} catch (error) {
  log(
    JSON.stringify(
      {
        error:
          "Could not read Firestore. Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON before running the live migration.",
        message: error.message,
        projectId: PROJECT_ID,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
