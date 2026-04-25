import { Link } from "react-router-dom";
import { formatCategory, formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
} from "../constants/lineStatuses";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";

function ProfilePage({ lines, user }) {
  return (
    <section className="app-page">
      <div className="page-head">
        <div className="page-copy">
          <p className="eyebrow">Your profile</p>
          <h2>Your ideas</h2>
          <p className="page-description">
            See everything you submitted, how it is performing, and which ones
            became top picks.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <article className="section-card profile-card profile-card--hero">
          <span className="auth-chip">
            {user.displayName || user.email || "community member"}
          </span>
          <div className="profile-stats">
            <div>
              <strong>{lines.length}</strong>
              <span>submitted ideas</span>
            </div>
            <div>
              <strong>
                {
                  lines.filter((line) => line.status === LINE_STATUS_PENDING)
                    .length
                }
              </strong>
              <span>awaiting review</span>
            </div>
          </div>
        </article>

        <article className="section-card profile-card">
          <div className="card-heading">
            <p className="eyebrow">Your ideas</p>
            <h3>Everything you added to the board</h3>
          </div>
          <div className="profile-list">
            {!lines.length ? (
              <p className="empty-state">
                You have not submitted any ideas yet.
              </p>
            ) : null}
            {lines.map((line) => (
              <article key={line.id} className="profile-line">
                <div className="line-badges">
                  <span className="category-chip">
                    {formatCategory(line.category)}
                  </span>
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
                <p>{line.text}</p>
                {line.status === LINE_STATUS_REJECTED &&
                line.moderationReason ? (
                  <p className="moderation-note">
                    Review note: {line.moderationReason}
                  </p>
                ) : null}
                <div className="line-footer line-footer--compact">
                  {line.status === LINE_STATUS_APPROVED ? (
                    <div className="line-actions">
                      <Link
                        className="action-link action-link--primary"
                        to={`/line/${line.id}`}
                      >
                        Open idea
                      </Link>
                      <button
                        className="action-button"
                        type="button"
                        onClick={() =>
                          shareUrl(
                            buildAbsoluteUrl(`/line/${line.id}`),
                            "IceBreaker idea",
                          )
                        }
                      >
                        Share
                      </button>
                    </div>
                  ) : (
                    <p className="form-note">
                      {line.status === LINE_STATUS_PENDING
                        ? "This idea is still waiting for approval."
                        : "Rejected ideas stay private to you and admins."}
                    </p>
                  )}
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
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
