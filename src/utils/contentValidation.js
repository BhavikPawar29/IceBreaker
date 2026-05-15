import { ALLOWED_CATEGORIES } from "../constants/categories";
import { QUESTION_PACKS, SITUATIONS } from "../data/conversationFilters";
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

const ALLOWED_PACKS = QUESTION_PACKS.map((pack) => pack.id);
const ALLOWED_SITUATIONS = SITUATIONS.map((situation) => situation.id);

function validateLineSubmission({ category, pack, situation, text }) {
  const trimmedText = text.trim();

  if (trimmedText.length < 12 || trimmedText.length > 240) {
    return "Lines must be between 12 and 240 characters.";
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return "Pick one of the supported categories.";
  }

  if (!ALLOWED_SITUATIONS.includes(situation)) {
    return "Pick one of the supported situations.";
  }

  if (!ALLOWED_PACKS.includes(pack)) {
    return "Pick one of the supported question packs.";
  }

  const blockedMatch = findBlockedContent(trimmedText);

  return blockedMatch ? blockedMatch.message : "";
}

export { BANNED_PATTERNS, findBlockedContent, validateLineSubmission };
