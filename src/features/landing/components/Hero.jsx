import { NavLink } from "react-router-dom";
import useIsMobile from "../../../shared/core/useIsMobile";
import { safeTrackEvent } from "../../../shared/core/analytics";
import SketchIllustration from "./SketchIllustration";

function trackCta(params) {
  try {
    safeTrackEvent("cta_clicked", params);
  } catch {
    // Analytics should never interfere with navigation.
  }
}

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

      <section className="hero-grid hero-grid--mobile" id="top">
        <div className="hero-copy">
          <h1>
            Questions are
            <span>more romantic</span>
            than compliments.
          </h1>
          <p className="hero-text">
            Open Breaking Ice, tap once, and get one natural thing to say for
            dates, crushes, new friends, or a dead group chat.
          </p>
          <div className="hero-proof-row" aria-label="Product principles">
            <span>Instant lines</span>
            <span>Real situations</span>
            <span>No endless scrolling</span>
          </div>
          <div className="hero-actions">
            <NavLink
              className="ink-link"
              to={user ? "/live" : "/login"}
              onClick={() =>
                trackCta({
                  cta_location: "hero",
                  cta_name: "steal_the_lines",
                  destination: user ? "/live" : "/login",
                })
              }
            >
              Steal the lines
            </NavLink>
            {user ? (
              <NavLink
                className="ghost-link"
                to="/promoted"
                onClick={() =>
                  trackCta({
                    cta_location: "hero",
                    cta_name: "browse_top_picks",
                    destination: "/promoted",
                  })
                }
              >
                Browse top picks
              </NavLink>
            ) : (
              <a
                className="ghost-link"
                href="#how-it-works"
                onClick={() =>
                  trackCta({
                    cta_location: "hero",
                    cta_name: "see_how_it_works",
                    destination: "#how-it-works",
                  })
                }
              >
                See how it works
              </a>
            )}
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
