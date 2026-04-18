import SketchIllustration from "./SketchIllustration";

function Hero({ authEnabled, isAuthReady, onSignIn, onSignOut, stats, user }) {
  return (
    <header className="hero">
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top">
          <span className="brand-mark">Sketchline</span>
          <span className="brand-sub">crowd-ranked openers</span>
        </a>
        <div className="topbar-actions">
          <div className="nav-note">
            vite + react / firebase auth + firestore
          </div>
          {authEnabled ? (
            user ? (
              <div className="auth-chip-group">
                <span className="auth-chip">
                  signed in as{" "}
                  {user.displayName || user.email || "community member"}
                </span>
                <button
                  className="ghost-link auth-button"
                  type="button"
                  onClick={onSignOut}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                className="ink-link auth-button"
                type="button"
                onClick={onSignIn}
                disabled={!isAuthReady}
              >
                {isAuthReady ? "Sign in with Google" : "Checking session..."}
              </button>
            )
          ) : (
            <span className="auth-chip">Firebase config not connected yet</span>
          )}
        </div>
      </nav>

      <section className="hero-grid" id="top">
        <div className="hero-copy">
          <p className="eyebrow">The Avant-Garde Sketch</p>
          <h1>
            Better
            <span>icebreakers</span>
            start with the crowd.
          </h1>
          <p className="hero-text">
            Discover community-submitted opening lines, vote on what actually
            feels fresh, and surface the strongest conversation starters to the
            top.
          </p>
          <div className="hero-actions">
            <a className="ink-link" href="#leaderboard">
              Explore the board
            </a>
            <a className="ghost-link" href="#submit">
              Share your own line
            </a>
          </div>
          <div className="hero-stats" aria-label="Platform summary">
            <article>
              <strong>{stats.total}</strong>
              <span>community lines</span>
            </article>
            <article>
              <strong>{stats.topScore}</strong>
              <span>top candidate score</span>
            </article>
            <article>
              <strong>{stats.approvedCount}</strong>
              <span>approved lines</span>
            </article>
          </div>
        </div>

        <SketchIllustration />
      </section>
    </header>
  );
}

export default Hero;
