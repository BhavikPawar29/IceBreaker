const DISPLAY_NAME_MIN_LENGTH = 2;
const DISPLAY_NAME_MAX_LENGTH = 32;
const DISPLAY_NAME_ALLOWED_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9 .'-]*[A-Za-z0-9])?$/;
const DISPLAY_NAME_BLOCKED_PATTERN =
  /\b(?:https?|www|discord|telegram|whatsapp|snap(?:chat)?|instagram|insta|onlyfans|admin|support|moderator|owner|fuck|bitch|slut|whore|nigg(?:a|er)|fagg?(?:ot)?|porn|nude|sex(?:y)?|horny|dick|cock|pussy|nut|ass|hell|deez)\b/i;

function normalizeDisplayName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function validateDisplayName(name) {
  const normalizedName = normalizeDisplayName(name);

  if (
    normalizedName.length < DISPLAY_NAME_MIN_LENGTH ||
    normalizedName.length > DISPLAY_NAME_MAX_LENGTH
  ) {
    return `Use ${DISPLAY_NAME_MIN_LENGTH}-${DISPLAY_NAME_MAX_LENGTH} characters for your name.`;
  }

  if (!DISPLAY_NAME_ALLOWED_PATTERN.test(normalizedName)) {
    return "Use letters, numbers, spaces, apostrophes, periods, or hyphens only.";
  }

  if (DISPLAY_NAME_BLOCKED_PATTERN.test(normalizedName)) {
    return "Pick a normal display name without handles, admin-style labels, or explicit words.";
  }

  return "";
}

export {
  DISPLAY_NAME_ALLOWED_PATTERN,
  DISPLAY_NAME_BLOCKED_PATTERN,
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  normalizeDisplayName,
  validateDisplayName,
};
