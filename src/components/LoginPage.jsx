import { useState } from "react";
import { Link } from "react-router-dom";
import Snackbar from "./Snackbar";
import useIsMobile from "../hooks/useIsMobile";

const PROVIDER_COPY = {
  apple: {
    button: "Continue with Apple",
    label: "Apple",
    note: "Use your Apple account",
  },
  facebook: {
    button: "Continue with Facebook",
    label: "Facebook",
    note: "Use your Facebook account",
  },
  google: {
    button: "Continue with Google",
    label: "Google",
    note: "Use your Google account",
  },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.9 0 9.2-4.8 9.2-7.3 0-.5-.1-.9-.1-1.3H12Z"
      />
      <path
        fill="#34A853"
        d="M2.8 7.9l3.2 2.3C6.8 8.4 9.2 6.6 12 6.6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.7 12 2.7c-3.6 0-6.8 2.1-8.2 5.2Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.3c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.5-1.8.9-3.2.9-3.7 0-5.1-2.5-5.3-3.8l-3.2 2.4c1.4 3.2 4.7 5.1 8.5 5.1Z"
      />
      <path
        fill="#4285F4"
        d="M2.8 7.9C2.2 9 1.9 10.5 1.9 12s.3 3 .9 4.1l3.2-2.4c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7L2.8 7.9Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12.1C24 5.4 18.6 0 12 0S0 5.4 0 12.1c0 6 4.4 11 10.1 11.9v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9v2.3h3.4l-.5 3.5h-2.9V24C19.6 23.1 24 18.1 24 12.1Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.8 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.5-.2-2.8.9-3.6.9-.8 0-1.9-.9-3.1-.9-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.1 2.9-2.2.9-1.3 1.3-2.6 1.3-2.6-.1 0-2.6-1-2.6-4.2Zm-2.3-6.8c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.3Z"
      />
    </svg>
  );
}

const PROVIDER_ICONS = {
  apple: AppleIcon,
  facebook: FacebookIcon,
  google: GoogleIcon,
};

function LoginPage({
  authEnabled,
  isAuthReady,
  onAppleSignIn,
  onFacebookSignIn,
  onGoogleSignIn,
}) {
  const isMobile = useIsMobile();
  const [feedback, setFeedback] = useState({ message: "", tone: "info" });
  const [activeProvider, setActiveProvider] = useState("");

  function showFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  function getFriendlyProviderMessage(error, providerKey) {
    if (error?.code === "app/provider-mismatch") {
      return {
        message: error.message,
        tone: "warning",
      };
    }

    if (error?.code === "app/provider-not-configured") {
      return {
        message: error.message,
        tone: "warning",
      };
    }

    if (error?.code === "auth/popup-closed-by-user") {
      return null;
    }

    return {
      message: `${PROVIDER_COPY[providerKey].label} sign-in did not go through. Please try again in a moment.`,
      tone: "warning",
    };
  }

  async function handleProviderSignIn(providerKey, signInAction) {
    setFeedback({ message: "", tone: "info" });
    setActiveProvider(providerKey);

    try {
      await signInAction();
    } catch (error) {
      const nextFeedback = getFriendlyProviderMessage(error, providerKey);
      if (nextFeedback) {
        showFeedback(nextFeedback.message, nextFeedback.tone);
      }
    } finally {
      setActiveProvider("");
    }
  }

  const providerButtons = [
    {
      key: "google",
      action: onGoogleSignIn,
    },
    {
      key: "facebook",
      action: onFacebookSignIn,
    },
    {
      key: "apple",
      action: onAppleSignIn,
    },
  ];

  return (
    <section className="main-shell login-page-shell">
      <div className="login-layout">
        {!isMobile ? (
          <aside className="login-side section-card">
            <p className="eyebrow">For shy people, not smooth talkers</p>
            <h1>Use the account you already trust.</h1>
            <p className="login-lead">
              Pick a provider and get straight to the ideas. No extra password
              flow. No account form to babysit.
            </p>

            <div className="login-points">
              <article>
                <strong>Fast entry</strong>
                <span>Use the account you already open every day.</span>
              </article>
              <article>
                <strong>Less noise</strong>
                <span>No custom passwords or extra sign-up steps here.</span>
              </article>
              <article>
                <strong>Cleaner identity</strong>
                <span>
                  Your provider account handles the sign-in side for us.
                </span>
              </article>
            </div>

            <div className="login-side-links">
              <Link className="ghost-link" to="/">
                Back to home
              </Link>
            </div>
          </aside>
        ) : null}

        <div className="login-shell section-card">
          <p className="eyebrow">Welcome in</p>
          <h2>Choose a provider</h2>
          <p className="login-copy">Pick one way in and keep moving.</p>

          <div className="provider-button-list">
            {providerButtons.map(({ key, action }) => (
              <button
                key={key}
                className={`provider-auth-button provider-auth-button--${key}`}
                type="button"
                onClick={() => handleProviderSignIn(key, action)}
                disabled={!authEnabled || !isAuthReady || activeProvider !== ""}
              >
                <span
                  className="provider-auth-button__badge"
                  aria-hidden="true"
                >
                  {(() => {
                    const Icon = PROVIDER_ICONS[key];
                    return <Icon />;
                  })()}
                </span>
                <span className="provider-auth-button__content">
                  <span className="provider-auth-button__copy">
                    {activeProvider === key
                      ? `Opening ${PROVIDER_COPY[key].label}...`
                      : PROVIDER_COPY[key].button}
                  </span>
                  <span className="provider-auth-button__note">
                    {PROVIDER_COPY[key].note}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="login-note login-note--soft">
            Use the same provider again if that email is already tied to one.
          </p>

          <Snackbar
            isVisible={Boolean(feedback.message)}
            message={feedback.message}
            tone={feedback.tone}
          />
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
