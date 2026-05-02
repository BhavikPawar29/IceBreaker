import Snackbar from "./Snackbar";
import { GoogleIcon } from "./authIcons";

function EyeIcon({ isHidden }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.2 12s3.2-5.8 8.8-5.8S20.8 12 20.8 12s-3.2 5.8-8.8 5.8S3.2 12 3.2 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      {isHidden ? (
        <path
          d="M4.8 4.8 19.2 19.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}

function LoginAuthCard({
  authEnabled,
  displayName,
  email,
  feedback,
  isAuthReady,
  isPasswordVisible,
  isSignup,
  isSubmitting,
  onDisplayNameChange,
  onEmailChange,
  onEmailSubmit,
  onGoogleSignIn,
  onPasswordChange,
  onPasswordReset,
  onSwitchMode,
  onTogglePassword,
  password,
  submitCopy,
  switchAction,
  switchCopy,
  title,
}) {
  return (
    <div className="login-shell section-card">
      <p className="eyebrow">Welcome in</p>
      <h2>{title}</h2>
      <p className="login-copy">
        {isSignup
          ? "Use email or continue with Google."
          : "Use the same method as before."}
      </p>

      <form className="login-form" onSubmit={onEmailSubmit}>
        {isSignup ? (
          <>
            <label htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={displayName}
              onChange={(event) => onDisplayNameChange(event.target.value)}
              minLength={2}
              maxLength={40}
              required
            />
          </>
        ) : null}

        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          autoComplete={isSignup ? "email" : "username"}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />

        <label htmlFor="auth-password">Password</label>
        <div className="password-field">
          <input
            id="auth-password"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="8-64 characters"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            minLength={8}
            maxLength={64}
            required
          />
          <button
            className="password-toggle"
            type="button"
            onClick={onTogglePassword}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <EyeIcon isHidden={isPasswordVisible} />
          </button>
        </div>
        {isSignup ? (
          <p className="login-helper">
            Use 8-64 characters with at least one letter and one number. No
            spaces or emoji.
          </p>
        ) : null}
        {!isSignup ? (
          <button
            className="login-reset-link"
            type="button"
            onClick={onPasswordReset}
            disabled={!authEnabled || !isAuthReady || isSubmitting}
          >
            Forgot password?
          </button>
        ) : null}

        <button
          className="login-submit"
          type="submit"
          disabled={!authEnabled || !isAuthReady || isSubmitting}
        >
          {isSubmitting ? "Opening..." : submitCopy}
        </button>
      </form>

      <div className="login-switch">
        <span>{switchCopy}</span>
        <button type="button" onClick={onSwitchMode}>
          {switchAction}
        </button>
      </div>

      <div className="login-divider">
        <span>or</span>
      </div>

      <button
        className="provider-auth-button provider-auth-button--google"
        type="button"
        onClick={onGoogleSignIn}
        disabled={!authEnabled || !isAuthReady || isSubmitting}
      >
        <span className="provider-auth-button__badge" aria-hidden="true">
          <GoogleIcon />
        </span>
        <span className="provider-auth-button__content">
          <span className="provider-auth-button__copy">
            Continue with Google
          </span>
          <span className="provider-auth-button__note">
            Fast sign-in with your Google account
          </span>
        </span>
      </button>

      <Snackbar
        isVisible={Boolean(feedback.message)}
        message={feedback.message}
        tone={feedback.tone}
      />
    </div>
  );
}

export default LoginAuthCard;
