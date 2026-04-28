import { Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
} from "../constants/lineStatuses";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";
import { getPublicDisplayNameFromUser } from "../utils/userIdentity";

function ProfilePage({ lines, user }) {
  const isMobile = useIsMobile();
  const publicName = getPublicDisplayNameFromUser(user);
  const statusOrder = [
    LINE_STATUS_PENDING,
    LINE_STATUS_APPROVED,
    LINE_STATUS_REJECTED,
  ];
  const statusBuckets = lines.reduce((groups, line) => {
    const key = line.status || LINE_STATUS_PENDING;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(line);
    return groups;
  }, {});
  const statusEntries = statusOrder
    .map((statusKey) => [statusKey, statusBuckets[statusKey] || []])
    .filter(([, statusLines]) => statusLines.length > 0);
  const statusDescriptions = {
    [LINE_STATUS_PENDING]: "Still private while the review queue catches up.",
    [LINE_STATUS_APPROVED]: "Live on the board and open for saves and shares.",
    [LINE_STATUS_REJECTED]:
      "Kept private to you and admins with review context.",
  };
  const statusEyebrows = {
    [LINE_STATUS_PENDING]: "In review",
    [LINE_STATUS_APPROVED]: "Approved",
    [LINE_STATUS_REJECTED]: "Rejected",
  };

  statusEntries.forEach(([, statusLines]) =>
    statusLines.sort((left, right) => {
      const leftTime = left.updatedAt || left.createdAt || 0;
      const rightTime = right.updatedAt || right.createdAt || 0;
      return rightTime - leftTime;
    }),
  );

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
        <article
          className={`section-card profile-card profile-card--hero ${
            isMobile ? "profile-card--hero-mobile" : ""
          }`}
        >
          <div className="profile-identity">
            <p className="eyebrow">Profile owner</p>
            <h3>{publicName}</h3>
            <p className="profile-identity-meta">
              {user.email || "Signed in member"}
            </p>
            <p className="profile-identity-note">
              Track what you shared, what is still in review, and which ideas
              made it through.
            </p>
          </div>
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
            <h3>Your board history</h3>
          </div>
          <div className="profile-list">
            {!lines.length ? (
              <p className="empty-state">
                You have not submitted any ideas yet.
              </p>
            ) : null}
            {statusEntries.map(([statusKey, statusLines]) => (
              <section key={statusKey} className="profile-category-group">
                <div className="profile-category-header">
                  <div>
                    <p className="eyebrow">
                      {statusEyebrows[statusKey] || "Status"}
                    </p>
                    <h4>{formatLineStatus(statusKey)}</h4>
                    <p className="profile-category-description">
                      {statusDescriptions[statusKey]}
                    </p>
                  </div>
                  <span className="profile-category-count">
                    {statusLines.length} idea
                    {statusLines.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="profile-category-list">
                  {statusLines.map((line) => (
                    <article
                      key={line.id}
                      className={`profile-line profile-line--${line.status || LINE_STATUS_PENDING}`}
                    >
                      <div className="line-badges">
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
                      <p className="profile-line-body">{line.text}</p>
                      {line.status === LINE_STATUS_APPROVED ? (
                        <div className="line-footer line-footer--compact">
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
                        </div>
                      ) : (
                        <div className="profile-status-panel">
                          <p className="profile-status-copy">
                            {line.status === LINE_STATUS_PENDING
                              ? "Still waiting for review."
                              : "Visible only to you and admins."}
                          </p>
                          {line.status === LINE_STATUS_REJECTED &&
                          line.moderationReason ? (
                            <p className="moderation-note">
                              Review note: {line.moderationReason}
                            </p>
                          ) : null}
                        </div>
                      )}
                      <div className="line-stats">
                        <span className="mini-stat">
                          <strong>{line.upvoteCount || 0}</strong>
                          saves
                        </span>
                        {line.status === LINE_STATUS_APPROVED &&
                        line.promoted ? (
                          <span className="mini-stat">
                            <strong>{line.promotionScore || line.score}</strong>
                            hit the mark
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
