import { formatCategory } from "../utils/board";

function FeaturedLine({ line }) {
  return (
    <div className="section-card crown-card">
      <div className="card-heading">
        <p className="eyebrow">Highest score</p>
        <h3>Current favorite</h3>
      </div>

      <article className="featured-line">
        {line ? (
          <>
            <blockquote>
              <span>&ldquo;</span>
              {line.text}
              <span>&rdquo;</span>
            </blockquote>
            <footer>
              <span className="score-chip">
                score <strong>{line.score}</strong>
              </span>
              <span className="category-chip">
                {formatCategory(line.category)}
              </span>
              <span className="author-chip">
                by {line.author || "anonymous sketcher"}
              </span>
            </footer>
          </>
        ) : (
          <p>No lines match this filter yet.</p>
        )}
      </article>
    </div>
  );
}

export default FeaturedLine;
