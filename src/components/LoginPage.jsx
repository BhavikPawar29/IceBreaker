import { useState } from "react";
import { Link } from "react-router-dom";
import Snackbar from "./Snackbar";
import useIsMobile from "../hooks/useIsMobile";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  validateDisplayName,
} from "../utils/profileValidation";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_ALLOWED_PATTERN =
  /^[A-Za-z0-9!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]+$/;
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 64;

function LoginPage({
  authEnabled,
  isAuthReady,
  onEmailSignIn,
  onGoogleSignIn,
  onEmailSignUp,
  onPasswordReset,
}) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [note, setNote] = useState("");
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    tone: "info",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function showNotice(message, tone = "info") {
    setSnackbar({
      isVisible: true,
      message,
      tone,
    });
  }

  function validateForm() {
    const email = form.email.trim();
    const password = form.password;
    const displayName = form.displayName.trim();

    if (!EMAIL_PATTERN.test(email)) {
      return "Use a real email address so we can create or find your account.";
    }

    if (
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      return `Use ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters for your password.`;
    }

    if (!PASSWORD_ALLOWED_PATTERN.test(password)) {
      return "Use letters, numbers, and common symbols only. Leave spaces and emoji out of the password.";
    }

    if (mode === "signup") {
      const displayNameValidation = validateDisplayName(displayName);

      if (displayNameValidation) {
        return displayNameValidation;
      }
    }

    return "";
  }

  function getFriendlyAuthMessage(error) {
    switch (error?.code) {
      case "app/account-not-found":
        setMode("signup");
        return {
          message:
            "You do not have an account yet. We switched you to Sign up so you can create one first.",
          tone: "warning",
          note: "New here? Create your account first, then come back and log in with the same email and password.",
        };
      case "app/password-mismatch":
        return {
          message:
            "That password does not match this email. Try again or use a different email if you meant to create a new account.",
          tone: "warning",
          note: "",
        };
      case "auth/email-already-in-use":
        setMode("signin");
        return {
          message:
            "That email already has an account. Log in instead of signing up again.",
          tone: "warning",
          note: "Your account is already set up. Use the Login tab with the same email and password.",
        };
      case "auth/weak-password":
        return {
          message: `Pick a stronger password with ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
          tone: "warning",
          note: "",
        };
      case "app/invalid-display-name":
        return {
          message: error.message,
          tone: "warning",
          note: "Keep your display name clean and easy for other people to recognize.",
        };
      case "auth/too-many-requests":
        return {
          message: "Too many attempts just now. Wait a bit, then try again.",
          tone: "warning",
          note: "",
        };
      default:
        return {
          message:
            mode === "signin"
              ? "We could not log you in right now. Check your details and try again."
              : "We could not create your account right now. Check the form and try again.",
          tone: "warning",
          note: "",
        };
    }
  }

  async function handlePasswordReset() {
    const email = form.email.trim();

    if (!EMAIL_PATTERN.test(email)) {
      const message =
        "Add your email first, then we can send you a password reset link.";
      setNote(message);
      showNotice(message, "warning");
      return;
    }

    setNote("");
    setSnackbar((current) => ({ ...current, isVisible: false }));
    setIsSubmitting(true);

    try {
      await onPasswordReset(email);
      showNotice(
        "If that account exists, we sent a password reset link to that email.",
        "success",
      );
    } catch (error) {
      showNotice(
        error?.code === "auth/too-many-requests"
          ? "Too many reset attempts. Wait a bit, then try again."
          : "We could not start the password reset right now. Please try again in a moment.",
        "warning",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSnackbar((current) => ({ ...current, isVisible: false }));
    setNote("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setNote(validationMessage);
      showNotice(validationMessage, "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        await onEmailSignIn(form.email.trim(), form.password);
      } else {
        await onEmailSignUp(
          form.email.trim(),
          form.password,
          form.displayName.trim(),
        );

        setMode("signin");
        setForm((current) => ({
          ...current,
          password: "",
        }));
        setNote(
          "Account created. For safety, log in now with the email and password you just made.",
        );
        showNotice(
          "Account created. Log in with the same email and password to continue.",
          "success",
        );
      }
    } catch (error) {
      const friendlyMessage = getFriendlyAuthMessage(error);
      setNote(friendlyMessage.note);
      showNotice(friendlyMessage.message, friendlyMessage.tone);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="main-shell login-page-shell">
      <div className="login-layout">
        {!isMobile ? (
          <aside className="login-side section-card">
            <p className="eyebrow">For shy people, not smooth talkers</p>
            <h1>Get past the &ldquo;what do I even say?&rdquo; part.</h1>
            <p className="login-lead">
              Find real conversation ideas, vote on the ones that actually help,
              and save the awkward moment before it turns into silence.
            </p>

            <div className="login-points">
              <article>
                <strong>Human-written</strong>
                <span>No AI filler or weird generated lines.</span>
              </article>
              <article>
                <strong>Actually useful</strong>
                <span>Good ideas rise because people vote on them.</span>
              </article>
              <article>
                <strong>Made for real situations</strong>
                <span>For people you know a little, not total strangers.</span>
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
          <p className="eyebrow">You are one step away</p>
          <h2>{mode === "signin" ? "Welcome back" : "Make your account"}</h2>
          <p className="login-copy">
            {mode === "signin"
              ? "Jump in, browse what is working, and keep the good ideas flowing."
              : "Create your profile first. After that, log in with the same email and password to get in."}
          </p>

          <div className="route-tabs login-tabs">
            <button
              className={`route-tab ${mode === "signin" ? "is-active" : ""}`}
              type="button"
              onClick={() => setMode("signin")}
            >
              Login
            </button>
            <button
              className={`route-tab ${mode === "signup" ? "is-active" : ""}`}
              type="button"
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <form className="submission-form login-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label>
                <span>Name</span>
                <input
                  name="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={handleChange}
                  minLength={DISPLAY_NAME_MIN_LENGTH}
                  maxLength={DISPLAY_NAME_MAX_LENGTH}
                  placeholder="What should people call you?"
                />
                <small className="field-hint">
                  Use your real first name or a simple nickname people can
                  trust.
                </small>
              </label>
            ) : null}
            <label>
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={PASSWORD_MAX_LENGTH}
                value={form.password}
                onChange={handleChange}
                placeholder={`${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`}
              />
              <small className="field-hint">
                Use {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters.
                Letters, numbers, and common symbols work best.
              </small>
            </label>
            {mode === "signin" ? (
              <button
                className="text-action"
                type="button"
                onClick={handlePasswordReset}
                disabled={!authEnabled || !isAuthReady || isSubmitting}
              >
                Forgot password?
              </button>
            ) : null}
            <button
              className="submit-button login-submit"
              type="submit"
              disabled={!authEnabled || !isAuthReady || isSubmitting}
            >
              {isSubmitting
                ? mode === "signin"
                  ? "Checking details..."
                  : "Creating account..."
                : mode === "signin"
                  ? "Login with email"
                  : "Create account"}
            </button>
          </form>

          {isMobile ? (
            <>
              <div className="divider-text login-divider">
                <span>or continue with Google</span>
              </div>

              <button
                className="google-auth-button google-auth-button--mobile"
                type="button"
                onClick={onGoogleSignIn}
                disabled={!authEnabled || !isAuthReady}
              >
                Continue with Google
              </button>
            </>
          ) : (
            <>
              <button
                className="google-auth-button"
                type="button"
                onClick={onGoogleSignIn}
                disabled={!authEnabled || !isAuthReady}
              >
                Continue with Google
              </button>

              <div className="divider-text login-divider">
                <span>or use email</span>
              </div>
            </>
          )}

          {note ? <p className="form-note login-note">{note}</p> : null}
          <Snackbar
            isVisible={snackbar.isVisible}
            message={snackbar.message}
            tone={snackbar.tone}
          />
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
