import { reportError } from "./reportError";
import { safeTrackEvent } from "./analytics";
import { buildShareUrl } from "./shareFlow";

export function buildAbsoluteUrl(path) {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.origin).toString();
}

function buildClipboardPayload(text, url) {
  if (text && url) {
    return `${text}\n\n${url}`;
  }

  return text || url || "";
}

function getShareIdFromUrl(url) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).searchParams.get("share_id") || "";
  } catch {
    return "";
  }
}

export async function shareUrl({
  shareId = "",
  shareSurface = "unknown",
  shareType = "unknown",
  text = "",
  title,
  url,
}) {
  if (typeof window === "undefined") {
    return false;
  }

  const resolvedShareId = shareId || getShareIdFromUrl(url);

  try {
    safeTrackEvent("share_clicked", {
      share_id: resolvedShareId,
      share_surface: shareSurface,
      share_type: shareType,
    });

    if (navigator.share) {
      await navigator.share({ text, title, url });
      safeTrackEvent("share_completed", {
        share_id: resolvedShareId,
        share_method: "native",
        share_surface: shareSurface,
        share_type: shareType,
      });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildClipboardPayload(text, url));
      safeTrackEvent("share_completed", {
        share_id: resolvedShareId,
        share_method: "clipboard",
        share_surface: shareSurface,
        share_type: shareType,
      });
      return true;
    }
  } catch (error) {
    safeTrackEvent("share_failed", {
      share_id: resolvedShareId,
      share_surface: shareSurface,
      share_type: shareType,
    });
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

export function installShareRuntime() {
  globalThis.__ICEBREAKER_SHARE__ = {
    buildAbsoluteUrl,
    buildShareUrl,
    shareText,
    shareUrl,
  };
}
