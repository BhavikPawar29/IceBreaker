import { useState } from "react";
import { Link } from "react-router-dom";

function LoginPage({
  authEnabled,
  isAuthReady,
  onEmailSignIn,
  onGoogleSignIn,
  onEmailSignUp,
}) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [note, setNote] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (mode === "signin") {
        await onEmailSignIn(form.email.trim(), form.password);
      } else {
        await onEmailSignUp(
          form.email.trim(),
          form.password,
          form.displayName.trim(),
        );
      }
    } catch (error) {
      setNote(error.message || "Authentication failed.");
    }
  }

  return (
    <section className="main-shell login-page-shell">
      <div className="login-layout">
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

        <div className="login-shell section-card">
          <p className="eyebrow">You are one step away</p>
          <h2>{mode === "signin" ? "Welcome back" : "Make your account"}</h2>
          <p className="login-copy">
            {mode === "signin"
              ? "Jump in, browse what is working, and keep the good ideas flowing."
              : "Create your profile and start adding, saving, and voting on better conversation ideas."}
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

          <form className="submission-form login-form" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <label>
                <span>Name</span>
                <input
                  name="displayName"
                  type="text"
                  value={form.displayName}
                  onChange={handleChange}
                  placeholder="What should people call you?"
                />
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
                minLength="6"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
              />
            </label>
            <button
              className="submit-button login-submit"
              type="submit"
              disabled={!authEnabled || !isAuthReady}
            >
              {mode === "signin" ? "Login with email" : "Create account"}
            </button>
          </form>

          {note ? <p className="form-note login-note">{note}</p> : null}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
