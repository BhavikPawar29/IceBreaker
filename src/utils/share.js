import { reportError } from "./reportError";

export async function shareUrl(url, title) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (error) {
    reportError("Failed to share url.", error);
  }

  return false;
}

export async function shareText(text, title = "Breaking Ice") {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (navigator.share) {
      await navigator.share({ text, title });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    reportError("Failed to share text.", error);
  }

  return false;
}

export function buildAbsoluteUrl(path) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}
