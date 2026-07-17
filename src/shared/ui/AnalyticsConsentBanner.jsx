import { Link } from "react-router-dom";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "../core/analyticsConsent";

function AnalyticsConsentBanner({ onDecision }) {
  if (getAnalyticsConsent() !== "unknown") {
    return null;
  }

  function handleDecision(decision) {
    setAnalyticsConsent(decision);
    onDecision(decision);
  }

  return (
    <section
      className="status-banner status-banner--consent"
      aria-live="polite"
    >
      <div className="status-banner-copy">
        <strong>Analytics cookies</strong>
        <span>
          Breaking Ice uses Firebase Analytics to measure product usage. Accept
          analytics cookies or decline them. Read more in our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </span>
      </div>
      <div className="status-banner-actions">
        <button
          className="ghost-link"
          type="button"
          onClick={() => handleDecision("rejected")}
        >
          Decline
        </button>
        <button
          className="ink-link"
          type="button"
          onClick={() => handleDecision("accepted")}
        >
          Accept
        </button>
      </div>
    </section>
  );
}

export default AnalyticsConsentBanner;
