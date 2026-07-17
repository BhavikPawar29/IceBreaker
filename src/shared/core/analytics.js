import { logEvent, setUserId, setUserProperties } from "firebase/analytics";
import { getAnalyticsInstance } from "../lib/firebase";

async function withAnalytics(callback) {
  try {
    const analytics = await getAnalyticsInstance();

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

function safeTrackEvent(name, params = {}) {
  try {
    return trackEvent(name, params);
  } catch (error) {
    console.warn("Analytics event skipped.", error);
  }
}

function bindAnalyticsUser(user) {
  void withAnalytics((analytics) => {
    setUserId(analytics, user?.uid || null);

    if (user?.uid) {
      setUserProperties(analytics, {
        auth_provider:
          user.providerData?.[0]?.providerId || user.providerId || "unknown",
      });
      return;
    }

    setUserProperties(analytics, {
      auth_provider: "",
    });
  });
}

export { bindAnalyticsUser, safeTrackEvent, trackEvent };
