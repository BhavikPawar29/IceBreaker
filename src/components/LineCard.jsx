import { formatCategory } from "../utils/board";

function LineCard({ canVote, line, rank, voteState, onVote }) {
  return (
    <article className="line-card">
      <div className="line-meta">
        <span className="line-rank">#{rank}</span>
        <span className="line-category">{formatCategory(line.category)}</span>
      </div>
      <p className="line-body">{line.text}</p>
      <div className="line-footer">
        <div className="line-author">
          Shared by {line.createdByName || line.author || "anonymous sketcher"}
        </div>
        <div className="vote-panel">
          <button
            className={`vote-button vote-up ${voteState === 1 ? "is-active" : ""}`}
            type="button"
            aria-label="Upvote line"
            disabled={!canVote}
            onClick={() => onVote(line.id, 1)}
            title={canVote ? "Upvote line" : "Sign in to vote"}
          >
            &#9650;
          </button>
          <strong className="vote-score">{line.score}</strong>
          <button
            className={`vote-button vote-down ${voteState === -1 ? "is-active" : ""}`}
            type="button"
            aria-label="Downvote line"
            disabled={!canVote}
            onClick={() => onVote(line.id, -1)}
            title={canVote ? "Downvote line" : "Sign in to vote"}
          >
            &#9660;
          </button>
        </div>
      </div>
    </article>
  );
}

export default LineCard;
