import { formatCategory } from "../utils/board";

function ApprovedShowcase({ approvedLines, isApprovedLoading }) {
  return (
    <section className="approved-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Approved showcase</p>
          <h2>Lines that already graduated out of the vote pool.</h2>
        </div>
      </div>

      <div className="approved-grid">
        {isApprovedLoading ? (
          <article className="section-card approved-card">
            <p className="empty-state">Loading approved lines...</p>
          </article>
        ) : null}

        {!isApprovedLoading && !approvedLines.length ? (
          <article className="section-card approved-card">
            <p className="empty-state">
              No lines have graduated yet. Once a candidate reaches net +50, it
              shows up here.
            </p>
          </article>
        ) : null}

        {approvedLines.map((line) => (
          <article key={line.id} className="section-card approved-card">
            <div className="approved-meta">
              <span className="line-category">
                {formatCategory(line.category)}
              </span>
              <span className="score-chip">
                promoted at <strong>{line.promotionScore ?? 50}</strong>
              </span>
            </div>
            <blockquote className="approved-quote">
              <span>&ldquo;</span>
              {line.text}
              <span>&rdquo;</span>
            </blockquote>
            <div className="approved-footer">
              <span className="author-chip">
                by {line.createdByName || "anonymous sketcher"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ApprovedShowcase;
