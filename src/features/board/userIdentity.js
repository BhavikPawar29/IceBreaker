const ANONYMOUS_AUTHOR_NAME = "Anonymous";
const PUBLIC_NAME_FALLBACK = ANONYMOUS_AUTHOR_NAME;

function normalizeProviderName(name) {
  if (typeof name !== "string") {
    return "";
  }

  return name.replace(/\s+/g, " ").trim();
}

function getPublicDisplayName() {
  return ANONYMOUS_AUTHOR_NAME;
}

function getPublicDisplayNameFromUser(user) {
  return user ? ANONYMOUS_AUTHOR_NAME : PUBLIC_NAME_FALLBACK;
}

export {
  ANONYMOUS_AUTHOR_NAME,
  PUBLIC_NAME_FALLBACK,
  getPublicDisplayName,
  getPublicDisplayNameFromUser,
  normalizeProviderName,
};
