import { NavLink } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import SketchIllustration from "./SketchIllustration";

function CountUp({ value, duration = 750 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const fromRef = useRef(0);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    startRef.current = 0;
    fromRef.current = displayValue;

    function step(timestamp) {
      if (!startRef.current) {
        startRef.current = timestamp;
      }

      const elapsed = timestamp - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      const nextValue = Math.round(
        fromRef.current + (value - fromRef.current) * eased,
      );

      setDisplayValue(nextValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameRef.current);
  }, [duration, value]);

  return <strong>{displayValue}</strong>;
}

function Hero({ authEnabled, stats, user }) {
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
              <CountUp value={stats.total} />
              <span>community lines</span>
            </article>
            <article>
              <CountUp value={stats.topScore} />
              <span>top live score</span>
            </article>
            <article>
              <CountUp value={stats.promotedCount} />
              <span>promoted lines</span>
            </article>
          </div>
        </div>

        <aside className="hero-side hero-art-shell">
          <SketchIllustration />
        </aside>
      </section>
    </header>
  );
}

export default Hero;
