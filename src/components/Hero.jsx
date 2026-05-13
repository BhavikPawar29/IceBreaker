import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import SketchIllustration from "./SketchIllustration";

function Hero({ authEnabled, user }) {
  const isMobile = useIsMobile();

  return (
    <header className="hero">
      <div className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">Breaking Ice</span>
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
            Questions are
            <span>more romantic than compliments.</span>
            Ask better things.
          </h1>
          <p className="hero-text">
            Questions can be more romantic than compliments. For shy people who
            already know someone a little, but need help keeping things going
            without sounding generic.
          </p>
          <div className="hero-proof-row" aria-label="Product principles">
            <span>Real community lines</span>
            <span>Voted by usage</span>
            <span>Promote what works</span>
          </div>
          <div className="hero-actions">
            <NavLink className="ink-link" to={user ? "/promoted" : "/login"}>
              {user ? "See what is working" : "Find better things to say"}
            </NavLink>
            <a className="ghost-link" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>

        {!isMobile ? (
          <aside className="hero-side">
            <div className="hero-art-frame">
              <SketchIllustration />
            </div>
          </aside>
        ) : null}
      </section>
    </header>
  );
}

export default Hero;
