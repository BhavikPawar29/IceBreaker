import { useEffect, useState } from "react";
import {
  ANALYTICS_CONSENT_EVENT,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../core/analyticsConsent";

const CONSENT_COPY = {
  accepted: "Analytics is on. Firebase Analytics can measure product usage.",
  rejected: "Analytics is off. Core app access still works without it.",
  unknown: "Choose whether Firebase Analytics can measure product usage.",
};

function AnalyticsConsentSettings() {
  const [consent, setConsent] = useState(() => getAnalyticsConsent());

  useEffect(() => {
    function syncConsent() {
      setConsent(getAnalyticsConsent());
    }

    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    window.addEventListener("storage", syncConsent);

    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
      window.removeEventListener("storage", syncConsent);
    };
  }, []);

  return (
    <section
      className="legal-section legal-consent-settings"
      id="analytics-settings"
    >
      <h3>Analytics settings</h3>
      <p>{CONSENT_COPY[consent]}</p>
      <div className="legal-consent-actions">
        <button
          className={consent === "rejected" ? "ink-link" : "ghost-link"}
          type="button"
          onClick={() => setAnalyticsConsent("rejected")}
        >
          Decline analytics
        </button>
        <button
          className={consent === "accepted" ? "ink-link" : "ghost-link"}
          type="button"
          onClick={() => setAnalyticsConsent("accepted")}
        >
          Accept analytics
        </button>
      </div>
    </section>
  );
}

export default AnalyticsConsentSettings;
