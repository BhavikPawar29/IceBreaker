import { Link } from "react-router-dom";
import { formatCategory, formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
} from "../constants/lineStatuses";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";
import { getPublicDisplayName } from "../utils/userIdentity";

function LineDetailPage({ line }) {
  if (line === undefined) {
    return (
      <section className="main-shell">
        <article className="section-card">
          <p className="empty-state">Loading idea...</p>
        </article>
      </section>
    );
  }

  if (!line) {
    return (
      <section className="main-shell">
        <article className="section-card">
          <p className="empty-state">This idea does not exist.</p>
        </article>
      </section>
    );
  }

  async function handleShare() {
    await shareUrl(buildAbsoluteUrl(`/line/${line.id}`), "IceBreaker idea");
  }

  const authorName = getPublicDisplayName(line.createdByName);

  return (
    <section className="main-shell">
      <article className="section-card detail-card detail-card--refined">
        <div className="line-badges">
          <span className="category-chip">{formatCategory(line.category)}</span>
          <span
            className={`status-chip status-chip--${line.status || LINE_STATUS_PENDING}`}
          >
            {formatLineStatus(line.status)}
          </span>
          {line.status === LINE_STATUS_APPROVED ? (
            <span className="score-chip">
              {line.promoted ? "Top pick" : "Still getting votes"}
            </span>
          ) : null}
        </div>
        <h2>{line.text}</h2>
        {line.moderationReason ? (
          <p className="moderation-note">
            Review note: {line.moderationReason}
          </p>
        ) : null}
        <div className="line-footer line-footer--compact">
          <p className="hero-text detail-author">
            Shared by{" "}
            <Link className="inline-link" to={`/profile/${line.createdByUid}`}>
              {authorName}
            </Link>
          </p>
          {line.status === LINE_STATUS_APPROVED ? (
            <div className="line-actions">
              <button
                className="action-button action-button--primary"
                type="button"
                onClick={handleShare}
              >
                Share
              </button>
            </div>
          ) : null}
        </div>
        <div className="line-stats">
          <span className="mini-stat">
            <strong>{line.upvoteCount || 0}</strong>
            saves
          </span>
          {line.status === LINE_STATUS_APPROVED && line.promoted ? (
            <span className="mini-stat">
              <strong>{line.promotionScore || line.score}</strong>
              hit the mark
            </span>
          ) : null}
        </div>
      </article>
    </section>
  );
}

export default LineDetailPage;
