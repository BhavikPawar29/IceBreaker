const SHARE_SOURCE = "share";
const PENDING_SHARE_AUTH_KEY = "__icebreaker_pending_share_auth__";

function generateShareId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildShareUrl(path, options = {}) {
  if (typeof window === "undefined") {
    return path;
  }

  const {
    shareId = generateShareId(),
    surface = "",
    type = "",
    targetPath = "",
  } = options;
  const url = new URL(path, window.location.origin);

  url.searchParams.set("src", SHARE_SOURCE);
  url.searchParams.set("share_id", shareId);

  if (surface) {
    url.searchParams.set("surface", surface);
  }

  if (type) {
    url.searchParams.set("type", type);
  }

  if (targetPath) {
    url.searchParams.set("target", targetPath);
  }

  return url.toString();
}

function getShareAttribution(search = "") {
  const params = new URLSearchParams(search || "");

  if (params.get("src") !== SHARE_SOURCE) {
    return null;
  }

  return {
    shareId: params.get("share_id") || "",
    shareSurface: params.get("surface") || "unknown",
    shareTarget: params.get("target") || "",
    shareType: params.get("type") || "unknown",
    source: SHARE_SOURCE,
  };
}

function rememberPendingShareAuth(details) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PENDING_SHARE_AUTH_KEY,
      JSON.stringify({
        ...details,
        capturedAt: Date.now(),
      }),
    );
  } catch {
    // Ignore storage failures. Analytics should not block auth.
  }
}

function consumePendingShareAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(PENDING_SHARE_AUTH_KEY);

    if (!rawValue) {
      return null;
    }

    window.sessionStorage.removeItem(PENDING_SHARE_AUTH_KEY);
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function clearPendingShareAuth() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(PENDING_SHARE_AUTH_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function buildLoginHref(options = {}) {
  if (typeof window === "undefined") {
    return "/login";
  }

  const {
    surface = "",
    type = "signup",
    targetPath = window.location.pathname,
  } = options;
  const url = new URL("/login", window.location.origin);

  url.searchParams.set("src", SHARE_SOURCE);

  if (surface) {
    url.searchParams.set("surface", surface);
  }

  if (type) {
    url.searchParams.set("type", type);
  }

  if (targetPath) {
    url.searchParams.set("target", targetPath);
  }

  return `${url.pathname}${url.search}`;
}

export {
  buildLoginHref,
  buildShareUrl,
  clearPendingShareAuth,
  consumePendingShareAuth,
  getShareAttribution,
  rememberPendingShareAuth,
};
