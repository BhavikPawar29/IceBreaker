import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import LoginAuthCard from "./LoginAuthCard";
import LoginDesktopView from "../views/desktop/LoginDesktopView";
import LoginMobileView from "../views/mobile/LoginMobileView";
import {
  validatePassword,
  validatePrivateName,
} from "../validation/validation";
import useIsMobile from "../../../shared/core/useIsMobile";
import { safeTrackEvent } from "../../../shared/core/analytics";
import { reportError } from "../../../shared/core/reportError";
import {
  clearPendingShareAuth,
  getShareAttribution,
  rememberPendingShareAuth,
} from "../../../shared/core/shareFlow";

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

function LoginPage({
  authEnabled,
  isAuthReady,
  onEmailLogin,
  onEmailSignUp,
  onPasswordReset,
  onGoogleSignIn,
}) {
  const isMobile = useIsMobile();
  const routeLocation = useLocation();
  const [mode, setMode] = useState("signup");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [feedback, setFeedback] = useState({ message: "", tone: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const shareAttribution = useMemo(
    () => getShareAttribution(routeLocation.search),
    [routeLocation.search],
  );
  const title = isSignup ? "Create your account" : "Welcome back";
  const submitCopy = isSignup ? "Sign up with email" : "Log in with email";
  const switchCopy = isSignup ? "Already a user?" : "New here?";
  const switchAction = isSignup ? "Log in" : "Create an account";

  function showFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  useEffect(() => {
    if (!shareAttribution) {
      clearPendingShareAuth();
      return;
    }

    safeTrackEvent("share_login_viewed", {
      share_id: shareAttribution.shareId,
      share_surface: shareAttribution.shareSurface,
      share_target: shareAttribution.shareTarget,
      share_type: shareAttribution.shareType,
    });
  }, [shareAttribution]);

  function switchMode() {
    safeTrackEvent("auth_mode_switched", {
      from_mode: mode,
      to_mode: isSignup ? "login" : "signup",
    });
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
    safeTrackEvent("auth_submit_clicked", {
      acquisition_source: shareAttribution?.source || "",
      auth_method: "password",
      auth_mode: mode,
      share_surface: shareAttribution?.shareSurface || "",
      share_type: shareAttribution?.shareType || "",
    });

    if (shareAttribution) {
      rememberPendingShareAuth({
        auth_intent_mode: mode,
        auth_method: "password",
        share_id: shareAttribution.shareId,
        share_surface: shareAttribution.shareSurface,
        share_target: shareAttribution.shareTarget,
        share_type: shareAttribution.shareType,
      });
    }

    try {
      if (isSignup) {
        await onEmailSignUp(email, password, displayName);
      } else {
        await onEmailLogin(email, password);
      }
    } catch (error) {
      clearPendingShareAuth();
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
    safeTrackEvent("auth_submit_clicked", {
      acquisition_source: shareAttribution?.source || "",
      auth_method: "google",
      auth_mode: mode,
      share_surface: shareAttribution?.shareSurface || "",
      share_type: shareAttribution?.shareType || "",
    });

    if (shareAttribution) {
      rememberPendingShareAuth({
        auth_intent_mode: mode,
        auth_method: "google",
        share_id: shareAttribution.shareId,
        share_surface: shareAttribution.shareSurface,
        share_target: shareAttribution.shareTarget,
        share_type: shareAttribution.shareType,
      });
    }

    try {
      await onGoogleSignIn();
    } catch (error) {
      clearPendingShareAuth();
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
    safeTrackEvent("password_reset_requested", {
      auth_mode: mode,
    });

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
