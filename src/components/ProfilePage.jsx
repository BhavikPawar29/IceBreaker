import { Link } from "react-router-dom";
import { formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
  LINE_STATUS_REMOVED,
} from "../constants/lineStatuses";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";

const STATUS_ORDER = [
  LINE_STATUS_PENDING,
  LINE_STATUS_APPROVED,
  LINE_STATUS_REJECTED,
  LINE_STATUS_REMOVED,
];

const STATUS_META = {
  [LINE_STATUS_PENDING]: {
    eyebrow: "In review",
    title: "Waiting room",
    note: "Private until an admin approves it.",
  },
  [LINE_STATUS_APPROVED]: {
    eyebrow: "Live",
    title: "On the board",
    note: "Visible publicly as anonymous ideas.",
  },
  [LINE_STATUS_REJECTED]: {
    eyebrow: "Needs work",
    title: "Rejected",
    note: "Private to you and admins with review context.",
  },
  [LINE_STATUS_REMOVED]: {
    eyebrow: "Archived",
    title: "Removed",
    note: "Soft-removed for audit and safety.",
  },
};

function getLineStatus(line) {
  return line.status || LINE_STATUS_PENDING;
}

function formatDate(value) {
  if (!value) {
    return "Not dated";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getFirstName(user) {
  const label = user.displayName || user.email || "there";
  return label.split(" ")[0].split("@")[0];
}

function ProfileStatusStat({ count, label, status }) {
  return (
    <div className={`profile-status-stat profile-status-stat--${status}`}>
      <strong>{count}</strong>
      <span>{label}</span>
    </div>
  );
}

function ProfileEmptyState() {
  return (
    <article className="section-card profile-empty-card">
      <p className="eyebrow">Start small</p>
      <h3>No ideas submitted yet</h3>
      <p>
        Add one useful line. It stays private until review, then goes live
        anonymously if approved.
      </p>
      <Link className="action-link action-link--primary" to="/create">
        Share one
      </Link>
    </article>
  );
}

function ProfileLine({ line }) {
  const status = getLineStatus(line);
  const isApproved = status === LINE_STATUS_APPROVED;

  return (
    <article className={`profile-line profile-line--${status}`}>
      <div className="profile-line-top">
        <div className="line-badges">
          <span className={`status-chip status-chip--${status}`}>
            {formatLineStatus(status)}
          </span>
          {isApproved ? (
            <span className="score-chip">
              {line.promoted ? "Top pick" : "Getting saves"}
            </span>
          ) : null}
        </div>
        <span className="profile-line-date">
          {formatDate(line.updatedAt || line.createdAt)}
        </span>
      </div>

      <p className="profile-line-body">{line.text}</p>

      {isApproved ? (
        <div className="profile-line-actions">
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
              shareUrl(buildAbsoluteUrl(`/line/${line.id}`), "IceBreaker idea")
            }
          >
            Share
          </button>
        </div>
      ) : (
        <div className="profile-status-panel">
          <p className="profile-status-copy">
            {STATUS_META[status]?.note || "Private to you and admins."}
          </p>
          {status === LINE_STATUS_REJECTED && line.moderationReason ? (
            <p className="moderation-note">
              Review note: {line.moderationReason}
            </p>
          ) : null}
        </div>
      )}

      <div className="profile-line-stats">
        <span className="mini-stat">
          <strong>{line.upvoteCount || 0}</strong>
          saves
        </span>
        {isApproved && line.promoted ? (
          <span className="mini-stat">
            <strong>{line.promotionScore || line.score}</strong>
            top score
          </span>
        ) : null}
      </div>
    </article>
  );
}

function ProfilePage({ lines, user }) {
  const sortedLines = [...lines].sort((left, right) => {
    const leftTime = left.updatedAt || left.createdAt || 0;
    const rightTime = right.updatedAt || right.createdAt || 0;
    return rightTime - leftTime;
  });
  const buckets = STATUS_ORDER.reduce((groups, status) => {
    groups[status] = [];
    return groups;
  }, {});

  sortedLines.forEach((line) => {
    const status = getLineStatus(line);
    if (!buckets[status]) {
      buckets[status] = [];
    }
    buckets[status].push(line);
  });

  const approvedCount = buckets[LINE_STATUS_APPROVED].length;
  const pendingCount = buckets[LINE_STATUS_PENDING].length;
  const rejectedCount = buckets[LINE_STATUS_REJECTED].length;
  const removedCount = buckets[LINE_STATUS_REMOVED].length;
  const saveCount = lines.reduce(
    (total, line) => total + (line.upvoteCount || 0),
    0,
  );
  const promotedCount = lines.filter((line) => line.promoted).length;
  const statusEntries = STATUS_ORDER.map((status) => [
    status,
    buckets[status] || [],
  ]).filter(([, statusLines]) => statusLines.length > 0);

  return (
    <section className="app-page profile-page">
      <article className="section-card profile-dashboard-hero">
        <div className="profile-avatar" aria-hidden="true">
          {getFirstName(user).slice(0, 1).toUpperCase()}
        </div>
        <div className="profile-dashboard-copy">
          <p className="eyebrow">Private profile</p>
          <h2>Hey {getFirstName(user)}, this is your board room.</h2>
          <p>
            Public posts stay anonymous. This page is just for your account,
            review status, saves, and moderation notes.
          </p>
          <div className="profile-account-pill">
            <span>Signed in as</span>
            <strong>{user.email || "Firebase account"}</strong>
          </div>
        </div>
        <div className="profile-hero-metrics">
          <ProfileStatusStat
            count={lines.length}
            label="total"
            status="total"
          />
          <ProfileStatusStat
            count={approvedCount}
            label="approved"
            status={LINE_STATUS_APPROVED}
          />
          <ProfileStatusStat
            count={pendingCount}
            label="in review"
            status={LINE_STATUS_PENDING}
          />
          <ProfileStatusStat count={saveCount} label="saves" status="saves" />
        </div>
      </article>

      <div className="profile-quick-grid">
        <article className="profile-mini-card">
          <span>Top picks</span>
          <strong>{promotedCount}</strong>
        </article>
        <article className="profile-mini-card">
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </article>
        <article className="profile-mini-card">
          <span>Removed</span>
          <strong>{removedCount}</strong>
        </article>
      </div>

      {!lines.length ? <ProfileEmptyState /> : null}

      <div className="profile-board">
        {statusEntries.map(([status, statusLines]) => {
          const meta = STATUS_META[status] || {
            eyebrow: "Status",
            title: formatLineStatus(status),
            note: "Private account history.",
          };

          return (
            <section
              key={status}
              className="section-card profile-status-column"
            >
              <div className="profile-status-head">
                <div>
                  <p className="eyebrow">{meta.eyebrow}</p>
                  <h3>{meta.title}</h3>
                  <p>{meta.note}</p>
                </div>
                <span className={`status-chip status-chip--${status}`}>
                  {statusLines.length}
                </span>
              </div>
              <div className="profile-category-list">
                {statusLines.map((line) => (
                  <ProfileLine key={line.id} line={line} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default ProfilePage;
