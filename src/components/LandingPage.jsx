import { Link } from "react-router-dom";

function LandingPage({ authEnabled }) {
  return (
    <section className="landing-shell">
      <section className="landing-section feature-band">
        <div className="section-copy">
          <p className="eyebrow">For shy people</p>
          <h2>
            Not for strangers. For people who already know each other a little.
          </h2>
          <p>
            IceBreaker helps when there is already a small connection, but you
            still do not know what to ask next. The goal is to make
            conversations feel easier, warmer, and more natural.
          </p>
        </div>
        <div className="feature-list">
          <article className="section-card">
            <h3>Human suggestions only</h3>
            <p>
              Every idea comes from people and lived experience, not AI
              generated filler.
            </p>
          </article>
          <article className="section-card">
            <h3>Built for real awkwardness</h3>
            <p>
              These ideas are for shy moments, half-familiar people, and early
              conversations that need a gentle push.
            </p>
          </article>
          <article className="section-card">
            <h3>Community filtered</h3>
            <p>
              Weak ideas stay in the queue. Good ones earn votes and move into
              the promoted section.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section timeline-band" id="how-it-works">
        <div className="section-copy">
          <p className="eyebrow">How it works</p>
          <h2>A simple loop that keeps generic conversation ideas out.</h2>
        </div>
        <div className="timeline-grid">
          <article className="section-card timeline-card">
            <span className="timeline-step">01</span>
            <h3>Sign in and enter the lines board</h3>
            <p>
              The landing page is only for understanding the product. The actual
              lines experience starts after login.
            </p>
          </article>
          <article className="section-card timeline-card">
            <span className="timeline-step">02</span>
            <h3>Browse, vote, or add your own idea</h3>
            <p>
              Users can vote ideas up and add their own while they are still
              being tested by the community.
            </p>
          </article>
          <article className="section-card timeline-card">
            <span className="timeline-step">03</span>
            <h3>Promote only what feels useful</h3>
            <p>
              Once an idea reaches +50 net score, it becomes promoted and turns
              read-only for everyone else.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section proof-band">
        <div className="section-copy">
          <p className="eyebrow">Why this is different</p>
          <h2>It is not AI dating advice and it is not generic pickup copy.</h2>
        </div>
        <div className="comparison-grid">
          <article className="section-card comparison-card">
            <h3>What you get</h3>
            <ul className="comparison-list">
              <li>Human-written things to ask</li>
              <li>Conversation ideas shaped by actual experience</li>
              <li>Community voting on what feels usable</li>
              <li>A profile view of your own submitted ideas</li>
            </ul>
          </article>
          <article className="section-card comparison-card">
            <h3>What you do not get</h3>
            <ul className="comparison-list">
              <li>AI-generated filler</li>
              <li>Cold stranger pickup tactics</li>
              <li>Spammy one-liners with no context</li>
              <li>Editable promoted ideas</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="landing-section cta-band">
        <div className="section-card cta-card">
          <p className="eyebrow">When you are ready</p>
          <h2>
            Come steal a few good conversation saves from people who get it.
          </h2>
          <div className="hero-actions">
            <Link className="ink-link" to="/login">
              {authEnabled ? "Get inside the app" : "Firebase config required"}
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

export default LandingPage;
