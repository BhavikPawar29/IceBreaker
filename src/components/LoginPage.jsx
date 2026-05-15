import { useState } from "react";
import LoginAuthCard from "./LoginAuthCard";
import LoginDesktopView from "./LoginDesktopView";
import LoginMobileView from "./LoginMobileView";
import useIsMobile from "../hooks/useIsMobile";
import { reportError } from "../utils/reportError";

function getFriendlyAuthMessage(error, mode) {
  if (error?.code === "auth/email-already-in-use") {
    return "That email already has an account. Use Log in below instead.";
  }

  if (error?.code === "auth/weak-password") {
    return "Use 8-64 characters with at least one letter and one number.";
  }

  if (error?.code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (
    error?.code === "auth/invalid-credential" ||
    error?.code === "auth/wrong-password" ||
    error?.code === "auth/user-not-found"
  ) {
    return mode === "login"
      ? "That email or password does not match. Try again or create an account."
      : "That did not work. Check the email and password once.";
  }

  if (
    error?.code === "auth/operation-not-allowed" ||
    error?.code === "app/provider-not-configured"
  ) {
    return "This sign-in option is not ready yet. Ask the project owner to enable it.";
  }

  if (error?.code === "auth/unauthorized-domain") {
    return "This domain is not allowed for Firebase sign-in. Add it in Firebase Auth authorized domains.";
  }

  if (
    error?.code === "appCheck/fetch-status-error" ||
    error?.code === "appCheck/recaptcha-error"
  ) {
    return "App Check is blocking sign-in. Check the Firebase Web App ID, App Check key, or disable App Check locally.";
  }

  if (error?.code === "auth/network-request-failed") {
    return "Firebase could not be reached. Check the network, App Check, or blocked browser extensions.";
  }

  if (error?.code === "auth/internal-error") {
    return "Firebase Auth is blocked by App Check. Disable Auth App Check enforcement locally or register a valid debug token.";
  }

  if (error?.code === "auth/popup-blocked") {
    return "The Google sign-in popup was blocked. Allow popups for this site and try again.";
  }

  if (error?.code === "auth/cancelled-popup-request") {
    return "Another Google sign-in popup is already open. Close it and try again.";
  }

  if (error?.code === "auth/popup-closed-by-user") {
    return "";
  }

  return error?.code
    ? `Sign-in failed: ${error.code}.`
    : "That did not go through. Please try again in a moment.";
}

function validatePassword(password) {
  if (password.length < 8 || password.length > 64) {
    return "Use 8-64 characters for your password.";
  }

  if (/\s/.test(password)) {
    return "Password cannot include spaces.";
  }

  if (!/^[\x21-\x7E]+$/.test(password)) {
    return "Use letters, numbers, and common symbols only.";
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Use at least one letter and one number.";
  }

  return "";
}

function validatePrivateName(name) {
  const normalizedName = name.replace(/\s+/g, " ").trim();

  if (!normalizedName) {
    return "Add your name so admins can review responsibly.";
  }

  if (normalizedName.length < 2 || normalizedName.length > 40) {
    return "Use a name between 2 and 40 characters.";
  }

  if (!/^[a-zA-Z0-9 .'-]+$/.test(normalizedName)) {
    return "Use letters, numbers, spaces, dots, apostrophes, or hyphens.";
  }

  return "";
}

function LoginPage({
  authEnabled,
  isAuthReady,
  onEmailLogin,
  onEmailSignUp,
  onPasswordReset,
  onGoogleSignIn,
}) {
  const isMobile = useIsMobile();
  const [mode, setMode] = useState("signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", tone: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const title = isSignup ? "Create your account" : "Welcome back";
  const submitCopy = isSignup ? "Sign up with email" : "Log in with email";
  const switchCopy = isSignup ? "Already a user?" : "New here?";
  const switchAction = isSignup ? "Log in" : "Create an account";

  function showFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  function switchMode() {
    setMode(isSignup ? "login" : "signup");
    setFeedback({ message: "", tone: "info" });
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setFeedback({ message: "", tone: "info" });

    if (!authEnabled) {
      showFeedback("Sign-in is not connected yet.", "warning");
      return;
    }

    const passwordMessage = validatePassword(password);

    if (passwordMessage) {
      showFeedback(passwordMessage, "warning");
      return;
    }

    if (isSignup) {
      const nameMessage = validatePrivateName(displayName);

      if (nameMessage) {
        showFeedback(nameMessage, "warning");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isSignup) {
        await onEmailSignUp(email, password, displayName);
      } else {
        await onEmailLogin(email, password);
      }
    } catch (error) {
      reportError("Email auth failed.", error);
      const message = getFriendlyAuthMessage(error, mode);
      if (message) {
        showFeedback(message, "warning");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setFeedback({ message: "", tone: "info" });
    setIsSubmitting(true);

    try {
      await onGoogleSignIn();
    } catch (error) {
      reportError("Google auth failed.", error);
      const message = getFriendlyAuthMessage(error, "google");
      if (message) {
        showFeedback(message, "warning");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    setFeedback({ message: "", tone: "info" });

    if (!email.trim()) {
      showFeedback(
        "Enter your email first, then request a reset link.",
        "warning",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onPasswordReset(email);
      showFeedback(
        "If that email has an account, we sent a reset link.",
        "success",
      );
    } catch (error) {
      reportError("Password reset failed.", error);
      const message = getFriendlyAuthMessage(error, "reset");
      if (message) {
        showFeedback(message, "warning");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const authCard = (
    <LoginAuthCard
      authEnabled={authEnabled}
      displayName={displayName}
      email={email}
      feedback={feedback}
      isAuthReady={isAuthReady}
      isPasswordVisible={isPasswordVisible}
      isSignup={isSignup}
      isSubmitting={isSubmitting}
      onDisplayNameChange={setDisplayName}
      onEmailChange={setEmail}
      onEmailSubmit={handleEmailSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      onPasswordChange={setPassword}
      onPasswordReset={handlePasswordReset}
      onSwitchMode={switchMode}
      onTogglePassword={() =>
        setIsPasswordVisible((currentValue) => !currentValue)
      }
      password={password}
      submitCopy={submitCopy}
      switchAction={switchAction}
      switchCopy={switchCopy}
      title={title}
    />
  );

  return isMobile ? (
    <LoginMobileView authCard={authCard} />
  ) : (
    <LoginDesktopView authCard={authCard} />
  );
}

export default LoginPage;
