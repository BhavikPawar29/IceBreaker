import SketchIllustration from "./SketchIllustration";

function Hero({ stats }) {
  return (
    <header className="hero">
      <nav className="topbar" aria-label="Primary">
        <a className="brand" href="#top">
          <span className="brand-mark">Sketchline</span>
          <span className="brand-sub">crowd-ranked openers</span>
        </a>
        <div className="nav-note">vite + react / local-first community board</div>
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
            Discover community-submitted opening lines, vote on what actually feels
            fresh, and surface the strongest conversation starters to the top.
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
              <span>top score</span>
            </article>
            <article>
              <strong>{stats.freshCount}</strong>
              <span>fresh this session</span>
            </article>
          </div>
        </div>

        <SketchIllustration />
      </section>
    </header>
  );
}

export default Hero;
