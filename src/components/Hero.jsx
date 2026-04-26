import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import SketchIllustration from "./SketchIllustration";

function Hero({ authEnabled, stats, user }) {
  const isMobile = useIsMobile();

  return (
    <header className="hero">
      <div className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">IceBreaker</span>
        </a>
        {!authEnabled ? (
          <span className="auth-chip">Firebase config not connected yet</span>
        ) : null}
      </div>

      <section
        className={`hero-grid ${isMobile ? "hero-grid--mobile" : ""}`}
        id="top"
      >
        <div className="hero-copy">
          <h1>
            Stop blanking
            <span>when it matters.</span>
            Ask better things.
          </h1>
          <p className="hero-text">
            Human-backed conversation ideas for shy people who already know
            someone a little, but need help keeping things going without
            sounding generic.
          </p>
          <div className="hero-actions">
            <NavLink className="ink-link" to={user ? "/promoted" : "/login"}>
              {user ? "See what is working" : "Find better things to say"}
            </NavLink>
            <a className="ghost-link" href="#how-it-works">
              See how it works
            </a>
          </div>
          <div className="hero-stats" aria-label="Platform summary">
            <article>
              <strong>{stats.total}</strong>
              <span>community lines</span>
            </article>
            <article>
              <strong>{stats.topScore}</strong>
              <span>top live score</span>
            </article>
            <article>
              <strong>{stats.promotedCount}</strong>
              <span>promoted lines</span>
            </article>
          </div>
        </div>

        <div className={isMobile ? "hero-art-shell" : ""}>
          <SketchIllustration />
        </div>
      </section>
    </header>
  );
}

export default Hero;
