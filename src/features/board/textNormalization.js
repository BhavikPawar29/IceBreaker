function normalizeLineText(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256Hex(value) {
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return [...new Uint8Array(buffer)]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("");
}

async function createLineFingerprint(text) {
  const normalizedText = normalizeLineText(text);
  const fingerprint = await sha256Hex(normalizedText);

  return {
    fingerprint,
    normalizedText,
  };
}

export { createLineFingerprint, normalizeLineText };
