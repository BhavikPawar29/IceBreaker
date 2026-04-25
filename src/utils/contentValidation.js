import { ALLOWED_CATEGORIES } from "../constants/categories";
import { normalizeLineText } from "./textNormalization";

const BANNED_PATTERNS = [
  {
    message: "Links, handles, and contact-chasing are not allowed here.",
    regex:
      /\b(?:https?|www|discord|telegram|whatsapp|snap(?:chat)?|instagram|insta|onlyfans|dm me|message me|text me|call me|email me)\b/i,
  },
  {
    message: "Keep it clean. Explicit or hateful language is blocked.",
    regex:
      /\b(?:fuck|fucking|bitch|slut|whore|nigg(?:a|er)|fagg?(?:ot)?|porn|nude|sex(?:y)?|horny|dick|cock|pussy)\b/i,
  },
  {
    message: "That looks too spammy. Keep it natural and conversational.",
    regex: /(.)\1{5,}/i,
  },
];

function findBlockedContent(text) {
  const normalizedText = normalizeLineText(text);

  return (
    BANNED_PATTERNS.find(
      ({ regex }) => regex.test(text) || regex.test(normalizedText),
    ) || null
  );
}

function validateLineSubmission({ category, text }) {
  const trimmedText = text.trim();

  if (trimmedText.length < 12 || trimmedText.length > 240) {
    return "Lines must be between 12 and 240 characters.";
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return "Pick one of the supported categories.";
  }

  const blockedMatch = findBlockedContent(trimmedText);

  return blockedMatch ? blockedMatch.message : "";
}

export { BANNED_PATTERNS, findBlockedContent, validateLineSubmission };
