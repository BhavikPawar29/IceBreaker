const ANALYTICS_CONSENT_KEY = "icebreaker.analyticsConsent";
const ANALYTICS_CONSENT_EVENT = "icebreaker:analytics-consent-changed";

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function getAnalyticsConsent() {
  if (!canUseBrowserStorage()) {
    return "unknown";
  }

  const storedValue = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return storedValue === "accepted" || storedValue === "rejected"
    ? storedValue
    : "unknown";
}

function emitAnalyticsConsentChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(ANALYTICS_CONSENT_EVENT, {
      detail: { decision: getAnalyticsConsent() },
    }),
  );
}

function hasAnalyticsConsent() {
  return getAnalyticsConsent() === "accepted";
}

function setAnalyticsConsent(decision) {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (decision !== "accepted" && decision !== "rejected") {
    window.localStorage.removeItem(ANALYTICS_CONSENT_KEY);
    emitAnalyticsConsentChange();
    return;
  }

  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, decision);
  emitAnalyticsConsentChange();
}

export {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  hasAnalyticsConsent,
  setAnalyticsConsent,
};
