import { Link } from "react-router-dom";
import { formatCategory } from "../utils/board";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";
import { getPublicDisplayName } from "../utils/userIdentity";

function LineCard({ canVote, line, rank, voteState, onVote }) {
  async function handleShare() {
    await shareUrl(buildAbsoluteUrl(`/line/${line.id}`), "IceBreaker idea");
  }

  const authorName = getPublicDisplayName(line.createdByName);

  return (
    <article className="section-card line-card">
      <div className="line-meta">
        <span className="line-rank">#{rank}</span>
        <div className="line-badges">
          <span className="category-chip">{formatCategory(line.category)}</span>
          {line.promoted ? (
            <span className="score-chip">Top pick</span>
          ) : (
            <span className="score-chip">Still getting votes</span>
          )}
        </div>
      </div>
      <p className="line-body">{line.text}</p>
      <div className="line-footer">
        <div className="line-footer-left">
          <div className="line-author">Shared by {authorName}</div>
          <div className="line-actions">
            <Link
              className="action-link action-link--primary"
              to={`/line/${line.id}`}
            >
              Open idea
            </Link>
            <Link className="action-link" to={`/profile/${line.createdByUid}`}>
              View author
            </Link>
            <button
              className="action-button"
              type="button"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
        </div>

        <div className="line-footer-right">
          <span className="mini-stat">
            <strong>{line.upvoteCount || 0}</strong>
            saves
          </span>
          {line.promoted ? (
            <span className="mini-stat">
              <strong>{line.promotionScore || line.score}</strong>
              hit the mark
            </span>
          ) : (
            <div className="vote-panel">
              <button
                className={`vote-button ${voteState === 1 ? "is-active" : ""}`}
                type="button"
                aria-label="Upvote line"
                disabled={!canVote}
                onClick={() => onVote(line.id)}
                title={canVote ? "Save this idea" : "Sign in to vote"}
              >
                &#9650;
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default LineCard;
