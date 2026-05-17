import { Link } from "react-router-dom";
import { formatCategory, formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
} from "../constants/lineStatuses";
import RouteShimmer from "./RouteShimmer";
import StatePanel from "./StatePanel";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function LineDetailPage({ line }) {
  if (line === undefined) {
    return (
      <section className="main-shell">
        <article className="section-card detail-card detail-card--loading">
          <RouteShimmer />
          <p className="empty-state">Opening this idea...</p>
        </article>
      </section>
    );
  }

  if (!line) {
    return (
      <section className="main-shell">
        <StatePanel
          className="section-card"
          eyebrow="No result"
          message="This link may be old, or the idea may have been removed."
          title="This idea does not exist."
          variant="empty"
        />
      </section>
    );
  }

  async function handleShare() {
    const shareRuntime = getShareRuntime();
    await shareRuntime?.shareUrl(
      shareRuntime.buildAbsoluteUrl(`/line/${line.id}`),
      "IceBreaker idea",
    );
  }

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
            Shared anonymously by{" "}
            <Link className="inline-link" to={`/profile/${line.createdByUid}`}>
              this contributor
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
