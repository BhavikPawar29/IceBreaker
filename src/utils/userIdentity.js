const PUBLIC_NAME_MAX_LENGTH = 32;
const PUBLIC_NAME_FALLBACK = "Community member";

function normalizeProviderName(name) {
  if (typeof name !== "string") {
    return "";
  }

  return name.replace(/\s+/g, " ").trim();
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function capPublicName(value) {
  if (value.length <= PUBLIC_NAME_MAX_LENGTH) {
    return value;
  }

  return `${value.slice(0, PUBLIC_NAME_MAX_LENGTH - 1).trimEnd()}…`;
}

function getPublicDisplayName(rawName) {
  const normalizedName = normalizeProviderName(rawName);

  if (
    !normalizedName ||
    normalizedName.length < 2 ||
    looksLikeEmail(normalizedName)
  ) {
    return PUBLIC_NAME_FALLBACK;
  }

  return capPublicName(normalizedName);
}

function getPublicDisplayNameFromUser(user) {
  return getPublicDisplayName(user?.displayName);
}

export {
  PUBLIC_NAME_FALLBACK,
  getPublicDisplayName,
  getPublicDisplayNameFromUser,
  normalizeProviderName,
};
