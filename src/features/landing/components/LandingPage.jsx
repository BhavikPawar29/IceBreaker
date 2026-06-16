import { Link } from "react-router-dom";
import { safeTrackEvent } from "../../../shared/core/analytics";

function trackCta(params) {
  try {
    safeTrackEvent("cta_clicked", params);
  } catch {
    // Analytics should never interfere with navigation.
  }
}

function LandingPage() {
  return (
    <section className="landing-shell">
      <section className="landing-section feature-band">
        <div className="section-copy">
          <p className="eyebrow">Made for real moments</p>
          <h2>Open it when your mind goes blank.</h2>
        </div>
        <div className="feature-list">
          <article className="section-card">
            <h3>Something to say now</h3>
            <p>
              Pick the situation and get one natural line you can actually use
              in the conversation.
            </p>
          </article>
          <article className="section-card">
            <h3>Fits the room</h3>
            <p>
              Date getting quiet, crush replying dry, new people around you, or
              a group chat going dead. Each mode keeps the line relevant.
            </p>
          </article>
          <article className="section-card">
            <h3>No content maze</h3>
            <p>
              Breaking Ice is not built for browsing forever. It gets you to one
              good line fast.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section timeline-band" id="how-it-works">
        <div className="section-copy">
          <p className="eyebrow">How it works</p>
          <h2>Three taps before the silence wins.</h2>
        </div>
        <div className="timeline-grid">
          <article className="section-card timeline-card">
            <span className="timeline-step">01</span>
            <h3>Start Live Mode</h3>
            <p>
              Use the fast screen when you need a line during an actual
              conversation.
            </p>
          </article>
          <article className="section-card timeline-card">
            <span className="timeline-step">02</span>
            <h3>Choose the situation</h3>
            <p>
              Pick date, crush, new friends, or group chat so the suggestion
              feels natural.
            </p>
          </article>
          <article className="section-card timeline-card">
            <span className="timeline-step">03</span>
            <h3>Say it or refresh</h3>
            <p>
              If the first line is not the one, refresh once and keep the
              conversation moving.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section proof-band">
        <div className="section-copy">
          <p className="eyebrow">The board helps it improve</p>
          <h2>Good lines can come from the people using them.</h2>
        </div>
        <div className="comparison-grid">
          <article className="section-card comparison-card">
            <h3>What you get</h3>
            <ul className="comparison-list">
              <li>A fast live assistant for awkward moments</li>
              <li>Simple modes for dates, crushes, friends, and group chats</li>
              <li>Playful, deep, and flirty packs without extra setup</li>
              <li>A board where useful community lines can rise</li>
            </ul>
          </article>
          <article className="section-card comparison-card">
            <h3>What it avoids</h3>
            <ul className="comparison-list">
              <li>Endless lists before you find something useful</li>
              <li>Cringe pickup scripts for strangers</li>
              <li>Overthinking the exact perfect message</li>
              <li>Complicated filters when you need speed</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="landing-section cta-band">
        <div className="section-card cta-card">
          <p className="eyebrow">Ready when it gets quiet</p>
          <h2>Get one good line before the moment passes.</h2>
          <div className="hero-actions">
            <Link
              className="ink-link"
              to="/login"
              onClick={() =>
                trackCta({
                  cta_location: "landing_cta_band",
                  cta_name: "steal_the_lines",
                  destination: "/login",
                })
              }
            >
              Steal the lines
            </Link>
            <a
              className="ghost-link"
              href="#how-it-works"
              onClick={() =>
                trackCta({
                  cta_location: "landing_cta_band",
                  cta_name: "see_how_it_works",
                  destination: "#how-it-works",
                })
              }
            >
              See how it works
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}

export default LandingPage;
