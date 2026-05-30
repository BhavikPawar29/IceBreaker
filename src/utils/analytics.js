import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { analyticsReady } from "../lib/firebase";

async function withAnalytics(callback) {
  try {
    const analytics = await analyticsReady;

    if (!analytics) {
      return;
    }

    callback(analytics);
  } catch (error) {
    console.warn("Analytics event skipped.", error);
  }
}

function trackEvent(name, params = {}) {
  void withAnalytics((analytics) => {
    logEvent(analytics, name, params);
  });
}

function bindAnalyticsUser(user) {
  void withAnalytics((analytics) => {
    setUserId(analytics, user?.uid || null);

    if (user?.uid) {
      setUserProperties(analytics, {
        auth_provider:
          user.providerData?.[0]?.providerId || user.providerId || "unknown",
      });
    }
  });
}

export { bindAnalyticsUser, trackEvent };
