import { Link } from "react-router-dom";

function LegalPageLayout({ eyebrow, title, intro, children }) {
  return (
    <section className="main-shell legal-shell">
      <section className="app-page legal-page">
        <article className="section-card legal-hero">
          <div className="page-copy">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="page-description legal-intro">{intro}</p>
          </div>
          <div className="page-actions legal-actions">
            <Link className="ghost-link" to="/">
              Back to home
            </Link>
            <Link className="ink-link" to="/login">
              Open IceBreaker
            </Link>
          </div>
        </article>
        <article className="section-card legal-card">{children}</article>
      </section>
    </section>
  );
}

export default LegalPageLayout;
