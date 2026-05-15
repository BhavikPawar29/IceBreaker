import { useMemo, useState } from "react";
import { ALLOWED_CATEGORIES } from "../constants/categories";
import { QUESTION_PACKS, SITUATIONS } from "../data/conversationFilters";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
  LINE_STATUS_REMOVED,
} from "../constants/lineStatuses";
import { formatCategory, formatLineStatus } from "../utils/board";
import { reportError } from "../utils/reportError";
import RouteShimmer from "./RouteShimmer";

const ADMIN_TABS = ["Overview", "Review", "Users", "Lines", "Bans"];
const STATUS_FILTERS = [
  "all",
  LINE_STATUS_PENDING,
  LINE_STATUS_APPROVED,
  LINE_STATUS_REJECTED,
  LINE_STATUS_REMOVED,
];
const ADMIN_SITUATIONS = [{ id: "any", label: "Any situation" }, ...SITUATIONS];

const CATEGORY_TO_PACK = {
  curious: "deep",
  deeper: "deep",
  playful: "playful",
  storytime: "deep",
  unexpected: "playful",
};

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function getProfileLabel(profile) {
  return profile?.displayName || "Unknown member";
}

function getProfileEmail(profile) {
  return profile?.email || "No email saved";
}

function getLineStatus(line) {
  return line.status || LINE_STATUS_PENDING;
}

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

function includesSearch(value, searchTerm) {
  return String(value || "")
    .toLowerCase()
    .includes(searchTerm);
}

function lineMatchesSearch(line, searchTerm, userMap) {
  if (!searchTerm) {
    return true;
  }

  const profile = userMap[line.createdByUid];

  return [
    line.id,
    line.text,
    line.category,
    getLineStatus(line),
    line.createdByUid,
    profile?.displayName,
    profile?.email,
  ].some((value) => includesSearch(value, searchTerm));
}

function userMatchesSearch(profile, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  return [profile.id, profile.displayName, profile.email].some((value) =>
    includesSearch(value, searchTerm),
  );
}

function banMatchesSearch(ban, profile, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  return [
    ban.id,
    ban.reason,
    ban.createdByUid,
    profile?.displayName,
    profile?.email,
  ].some((value) => includesSearch(value, searchTerm));
}

function AdminStatCard({ label, value }) {
  return (
    <article className="admin-stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function AdminMiniLine({ line, userMap }) {
  const profile = userMap[line.createdByUid];
  const status = getLineStatus(line);

  return (
    <article className="admin-mini-line">
      <div className="line-badges">
        <span className="category-chip">{formatCategory(line.category)}</span>
        <span className={`status-chip status-chip--${status}`}>
          {formatLineStatus(status)}
        </span>
      </div>
      <p>{line.text}</p>
      <small>
        {getProfileLabel(profile)} - {formatDate(line.createdAt)}
      </small>
    </article>
  );
}

function AdminLineCard({
  actionId,
  line,
  onCopyUid,
  onLiveMetadataChange,
  onStatusChange,
  reason,
  setReason,
  userMap,
}) {
  const profile = userMap[line.createdByUid];
  const isBusy = actionId === line.id;
  const status = getLineStatus(line);
  const liveSituation = line.situation || "any";
  const livePack = line.pack || CATEGORY_TO_PACK[line.category] || "playful";
  const canApprove = status !== LINE_STATUS_APPROVED;
  const canReject = status !== LINE_STATUS_REJECTED;
  const canRemove = status !== LINE_STATUS_REMOVED;

  return (
    <article className="section-card admin-line-card">
      <div className="line-badges">
        <span className="category-chip">{formatCategory(line.category)}</span>
        <span className={`status-chip status-chip--${status}`}>
          {formatLineStatus(status)}
        </span>
      </div>

      <p className="line-body">{line.text}</p>

      <div className="admin-live-fields">
        <label>
          <span>Live situation</span>
          <select
            value={liveSituation}
            disabled={isBusy}
            onChange={(event) =>
              onLiveMetadataChange(line.id, {
                pack: livePack,
                situation: event.target.value,
              })
            }
          >
            {ADMIN_SITUATIONS.map((situation) => (
              <option key={situation.id} value={situation.id}>
                {situation.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Question pack</span>
          <select
            value={livePack}
            disabled={isBusy}
            onChange={(event) =>
              onLiveMetadataChange(line.id, {
                pack: event.target.value,
                situation: liveSituation,
              })
            }
          >
            {QUESTION_PACKS.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {pack.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-meta-grid">
        <span>
          <strong>Name</strong>
          {getProfileLabel(profile)}
        </span>
        <span>
          <strong>Email</strong>
          {getProfileEmail(profile)}
        </span>
        <button
          className="admin-copy"
          type="button"
          onClick={() => onCopyUid(line.createdByUid)}
        >
          UID {line.createdByUid?.slice(0, 8) || "missing"}
        </button>
      </div>

      {line.moderationReason ? (
        <p className="moderation-note">Note: {line.moderationReason}</p>
      ) : null}

      <label className="submission-form moderation-form">
        <span>Reason for reject/remove</span>
        <textarea
          rows="3"
          maxLength="200"
          placeholder="Short note for audit and the submitter."
          value={reason || ""}
          onChange={(event) => setReason(line.id, event.target.value)}
        />
      </label>

      <div className="line-actions admin-action-row">
        {canApprove ? (
          <button
            className="action-button action-button--primary"
            type="button"
            disabled={isBusy}
            onClick={() => onStatusChange(line.id, LINE_STATUS_APPROVED)}
          >
            Approve
          </button>
        ) : null}
        {canReject ? (
          <button
            className="action-button"
            type="button"
            disabled={isBusy}
            onClick={() => onStatusChange(line.id, LINE_STATUS_REJECTED)}
          >
            Reject
          </button>
        ) : null}
        {canRemove ? (
          <button
            className="action-button action-button--danger"
            type="button"
            disabled={isBusy}
            onClick={() => onStatusChange(line.id, LINE_STATUS_REMOVED)}
          >
            Remove
          </button>
        ) : (
          <button
            className="action-button"
            type="button"
            disabled={isBusy}
            onClick={() => onStatusChange(line.id, LINE_STATUS_PENDING)}
          >
            Restore
          </button>
        )}
      </div>
    </article>
  );
}

function AdminUserCard({
  banMap,
  banReason,
  counts,
  isExpanded,
  isBusy,
  lines,
  onBan,
  onCopyUid,
  onToggle,
  onUnban,
  profile,
  setBanReason,
}) {
  const ban = banMap[profile.id];
  const isBanned = Boolean(ban);

  return (
    <article className="section-card admin-user-card">
      <div className="admin-user-top">
        <div>
          <h3>{getProfileLabel(profile)}</h3>
          <p>{getProfileEmail(profile)}</p>
        </div>
        <span
          className={`status-chip ${
            isBanned ? "status-chip--rejected" : "status-chip--approved"
          }`}
        >
          {isBanned ? "Banned" : "Active"}
        </span>
      </div>

      <div className="admin-meta-grid">
        <button
          className="admin-copy"
          type="button"
          onClick={() => onCopyUid(profile.id)}
        >
          UID {profile.id.slice(0, 8)}
        </button>
        <span>
          <strong>Total</strong>
          {counts.total || 0}
        </span>
        <span>
          <strong>Pending</strong>
          {counts.pending || 0}
        </span>
        <span>
          <strong>Approved</strong>
          {counts.approved || 0}
        </span>
      </div>

      {isBanned ? (
        <p className="moderation-note">Ban reason: {ban.reason}</p>
      ) : (
        <label className="admin-inline-field">
          <span>Ban reason</span>
          <input
            maxLength="200"
            placeholder="Spam, abuse, or unsafe behavior"
            value={banReason || ""}
            onChange={(event) => setBanReason(profile.id, event.target.value)}
          />
        </label>
      )}

      <div className="line-actions admin-action-row">
        <button className="action-button" type="button" onClick={onToggle}>
          {isExpanded ? "Hide lines" : "View lines"}
        </button>
        {isBanned ? (
          <button
            className="action-button action-button--primary"
            type="button"
            disabled={isBusy}
            onClick={() => onUnban(profile.id)}
          >
            Unban
          </button>
        ) : (
          <button
            className="action-button action-button--danger"
            type="button"
            disabled={isBusy}
            onClick={() => onBan(profile.id)}
          >
            Ban
          </button>
        )}
      </div>

      {isExpanded ? (
        <div className="admin-detail-panel">
          {lines.length ? (
            lines.map((line) => (
              <div key={line.id} className="admin-user-line">
                <span
                  className={`status-chip status-chip--${getLineStatus(line)}`}
                >
                  {formatLineStatus(getLineStatus(line))}
                </span>
                <p>{line.text}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No lines found for this user.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}

function AdminPage({ dashboard }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [actionId, setActionId] = useState("");
  const [banReasons, setBanReasons] = useState({});
  const [expandedUserId, setExpandedUserId] = useState("");
  const [lineCategoryFilter, setLineCategoryFilter] = useState("all");
  const [lineStatusFilter, setLineStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [reasons, setReasons] = useState({});
  const [banSearch, setBanSearch] = useState("");
  const [lineSearch, setLineSearch] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const {
    allKnownLines,
    banMap,
    banUser,
    bans,
    changeLineStatus,
    error,
    hasMoreBans,
    hasMoreLines,
    hasMoreReview,
    hasMoreUsers,
    isLoading,
    lineCountsByUser,
    lines,
    loadMoreBans,
    loadMoreLines,
    loadMoreReview,
    loadMoreUsers,
    loadingMore,
    reloadLines,
    reviewLines,
    stats,
    unbanUser,
    updateLineLiveMetadata,
    userMap,
    users,
  } = dashboard;

  const reviewSearchTerm = normalizeSearch(reviewSearch);
  const lineSearchTerm = normalizeSearch(lineSearch);
  const userSearchTerm = normalizeSearch(userSearch);
  const banSearchTerm = normalizeSearch(banSearch);

  const pendingLines = useMemo(
    () =>
      reviewLines.filter((line) =>
        lineMatchesSearch(line, reviewSearchTerm, userMap),
      ),
    [reviewLines, reviewSearchTerm, userMap],
  );

  const userRows = useMemo(() => {
    const rowsById = new Map(users.map((profile) => [profile.id, profile]));

    allKnownLines.forEach((line) => {
      if (line.createdByUid && !rowsById.has(line.createdByUid)) {
        rowsById.set(line.createdByUid, {
          id: line.createdByUid,
          displayName: "Unknown member",
          email: "Missing user profile",
        });
      }
    });

    return [...rowsById.values()].filter((profile) =>
      userMatchesSearch(profile, userSearchTerm),
    );
  }, [allKnownLines, userSearchTerm, users]);

  const newestUsers = useMemo(
    () =>
      [...users]
        .sort((left, right) => (right.updatedAt || 0) - (left.updatedAt || 0))
        .slice(0, 4),
    [users],
  );

  const oldestPending = useMemo(
    () =>
      [...pendingLines]
        .sort((left, right) => (left.createdAt || 0) - (right.createdAt || 0))
        .slice(0, 4),
    [pendingLines],
  );

  const filteredLines = useMemo(
    () =>
      lines.filter((line) => lineMatchesSearch(line, lineSearchTerm, userMap)),
    [lineSearchTerm, lines, userMap],
  );

  const filteredBans = useMemo(
    () =>
      bans.filter((ban) =>
        banMatchesSearch(ban, userMap[ban.id], banSearchTerm),
      ),
    [banSearchTerm, bans, userMap],
  );

  function updateReason(lineId, value) {
    setReasons((currentReasons) => ({
      ...currentReasons,
      [lineId]: value,
    }));
  }

  function updateBanReason(uid, value) {
    setBanReasons((currentReasons) => ({
      ...currentReasons,
      [uid]: value,
    }));
  }

  async function handleStatusChange(lineId, nextStatus) {
    setActionId(lineId);
    setMessage("");

    const result = await changeLineStatus(
      lineId,
      nextStatus,
      reasons[lineId] || "",
    );

    setActionId("");
    setMessage(result.message);

    if (result.ok) {
      updateReason(lineId, "");
    }
  }

  async function handleLiveMetadataChange(lineId, metadata) {
    setActionId(lineId);
    setMessage("");

    const result = await updateLineLiveMetadata(lineId, metadata);

    setActionId("");
    setMessage(result.message);
  }

  async function handleBan(uid) {
    setActionId(uid);
    setMessage("");

    const result = await banUser(uid, banReasons[uid] || "");

    setActionId("");
    setMessage(result.message);

    if (result.ok) {
      updateBanReason(uid, "");
    }
  }

  async function handleUnban(uid) {
    setActionId(uid);
    setMessage("");

    const result = await unbanUser(uid);

    setActionId("");
    setMessage(result.message);
  }

  async function handleLineStatusFilterChange(nextStatus) {
    setLineStatusFilter(nextStatus);
    setMessage("");

    try {
      await reloadLines({
        category: lineCategoryFilter,
        status: nextStatus,
      });
    } catch (nextError) {
      reportError("Failed to reload admin lines.", nextError);
      setMessage("Could not refresh lines for that filter.");
    }
  }

  async function handleLineCategoryFilterChange(nextCategory) {
    setLineCategoryFilter(nextCategory);
    setMessage("");

    try {
      await reloadLines({
        category: nextCategory,
        status: lineStatusFilter,
      });
    } catch (nextError) {
      reportError("Failed to reload admin lines.", nextError);
      setMessage("Could not refresh lines for that filter.");
    }
  }

  async function copyUid(uid) {
    if (!uid) {
      setMessage("No UID found.");
      return;
    }

    try {
      await navigator.clipboard.writeText(uid);
      setMessage("UID copied.");
    } catch {
      setMessage(uid);
    }
  }

  return (
    <section className="app-page admin-page">
      <div className="page-head admin-head">
        <div className="page-copy">
          <p className="eyebrow">Admin</p>
          <h2>Operations dashboard</h2>
          <p className="page-description">
            Review ideas, inspect users, manage bans, and watch the board.
          </p>
        </div>
      </div>

      <nav className="admin-tabs" aria-label="Admin sections">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? "is-active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {message || error ? (
        <article className="admin-alert">
          <p>{error || message}</p>
        </article>
      ) : null}

      {isLoading ? (
        <article
          className="section-card route-skeleton-card"
          aria-live="polite"
        >
          <RouteShimmer />
        </article>
      ) : null}

      {!isLoading && activeTab === "Overview" ? (
        <div className="admin-overview-grid">
          <div className="admin-overview-col">
            <div className="admin-stat-grid">
              <AdminStatCard label="Users" value={stats.users} />
              <AdminStatCard label="Pending" value={stats.pending} />
              <AdminStatCard label="Approved" value={stats.approved} />
              <AdminStatCard label="Rejected" value={stats.rejected} />
              <AdminStatCard label="Banned" value={stats.banned} />
              <AdminStatCard label="Promoted" value={stats.promoted} />
              <AdminStatCard label="Saves" value={stats.saves} />
              <AdminStatCard label="Removed" value={stats.removed} />
            </div>

            <article className="section-card admin-panel">
              <h3>Newest users</h3>
              {newestUsers.length ? (
                <div className="admin-mini-list">
                  {newestUsers.map((profile) => (
                    <div key={profile.id} className="admin-mini-row">
                      <span>{getProfileLabel(profile)}</span>
                      <small>{getProfileEmail(profile)}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No users yet.</p>
              )}
            </article>

            <article className="section-card admin-panel">
              <h3>Oldest pending</h3>
              {oldestPending.length ? (
                <div className="admin-mini-list">
                  {oldestPending.map((line) => (
                    <AdminMiniLine
                      key={line.id}
                      line={line}
                      userMap={userMap}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No pending queue.</p>
              )}
            </article>
          </div>

          <div className="admin-overview-col">
            <article className="section-card admin-panel">
              <h3>Newest submissions</h3>
              {lines.slice(0, 4).length ? (
                <div className="admin-mini-list">
                  {lines.slice(0, 4).map((line) => (
                    <AdminMiniLine
                      key={line.id}
                      line={line}
                      userMap={userMap}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No submissions yet.</p>
              )}
            </article>
          </div>
        </div>
      ) : null}

      {!isLoading && activeTab === "Review" ? (
        <div className="admin-card-list">
          <label className="admin-search-field">
            <span>Search pending</span>
            <input
              placeholder="Line, UID, email, or name"
              value={reviewSearch}
              onChange={(event) => setReviewSearch(event.target.value)}
            />
          </label>

          {pendingLines.length ? (
            pendingLines.map((line) => (
              <AdminLineCard
                key={line.id}
                actionId={actionId}
                line={line}
                onCopyUid={copyUid}
                onLiveMetadataChange={handleLiveMetadataChange}
                onStatusChange={handleStatusChange}
                reason={reasons[line.id]}
                setReason={updateReason}
                userMap={userMap}
              />
            ))
          ) : (
            <article className="section-card">
              <p className="empty-state">
                No matching pending ideas right now.
              </p>
            </article>
          )}

          {hasMoreReview ? (
            <div className="admin-load-row">
              <button
                className="action-button"
                type="button"
                disabled={loadingMore === "review"}
                onClick={loadMoreReview}
              >
                {loadingMore === "review" ? "Loading..." : "Load more pending"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && activeTab === "Users" ? (
        <div className="admin-card-list">
          <label className="admin-search-field">
            <span>Search users</span>
            <input
              placeholder="Name, email, or UID"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </label>

          {userRows.length ? (
            userRows.map((profile) => (
              <AdminUserCard
                key={profile.id}
                banMap={banMap}
                banReason={banReasons[profile.id]}
                counts={lineCountsByUser[profile.id] || {}}
                isExpanded={expandedUserId === profile.id}
                isBusy={actionId === profile.id}
                lines={allKnownLines.filter(
                  (line) => line.createdByUid === profile.id,
                )}
                onBan={handleBan}
                onCopyUid={copyUid}
                onToggle={() =>
                  setExpandedUserId((currentId) =>
                    currentId === profile.id ? "" : profile.id,
                  )
                }
                onUnban={handleUnban}
                profile={profile}
                setBanReason={updateBanReason}
              />
            ))
          ) : (
            <article className="section-card">
              <p className="empty-state">No matching user profiles found.</p>
            </article>
          )}

          {hasMoreUsers ? (
            <div className="admin-load-row">
              <button
                className="action-button"
                type="button"
                disabled={loadingMore === "users"}
                onClick={loadMoreUsers}
              >
                {loadingMore === "users" ? "Loading..." : "Load more users"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && activeTab === "Lines" ? (
        <div className="admin-card-list">
          <div className="admin-filter-bar">
            <label className="filter-pill">
              <span>Status</span>
              <select
                value={lineStatusFilter}
                onChange={(event) =>
                  handleLineStatusFilterChange(event.target.value)
                }
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All" : formatLineStatus(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-pill">
              <span>Category</span>
              <select
                value={lineCategoryFilter}
                onChange={(event) =>
                  handleLineCategoryFilterChange(event.target.value)
                }
              >
                <option value="all">All</option>
                {ALLOWED_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-search-field admin-search-field--inline">
              <span>Search loaded lines</span>
              <input
                placeholder="Line, UID, email, or name"
                value={lineSearch}
                onChange={(event) => setLineSearch(event.target.value)}
              />
            </label>
          </div>

          {filteredLines.length ? (
            filteredLines.map((line) => (
              <AdminLineCard
                key={line.id}
                actionId={actionId}
                line={line}
                onCopyUid={copyUid}
                onLiveMetadataChange={handleLiveMetadataChange}
                onStatusChange={handleStatusChange}
                reason={reasons[line.id]}
                setReason={updateReason}
                userMap={userMap}
              />
            ))
          ) : (
            <article className="section-card">
              <p className="empty-state">No lines match this filter.</p>
            </article>
          )}

          {hasMoreLines ? (
            <div className="admin-load-row">
              <button
                className="action-button"
                type="button"
                disabled={loadingMore === "lines"}
                onClick={() =>
                  loadMoreLines({
                    category: lineCategoryFilter,
                    status: lineStatusFilter,
                  })
                }
              >
                {loadingMore === "lines" ? "Loading..." : "Load more lines"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {!isLoading && activeTab === "Bans" ? (
        <div className="admin-card-list">
          <label className="admin-search-field">
            <span>Search bans</span>
            <input
              placeholder="Reason, UID, email, or name"
              value={banSearch}
              onChange={(event) => setBanSearch(event.target.value)}
            />
          </label>

          {filteredBans.length ? (
            filteredBans.map((ban) => {
              const profile = userMap[ban.id];

              return (
                <article key={ban.id} className="section-card admin-user-card">
                  <div className="admin-user-top">
                    <div>
                      <h3>{getProfileLabel(profile)}</h3>
                      <p>{getProfileEmail(profile)}</p>
                    </div>
                    <span className="status-chip status-chip--rejected">
                      Banned
                    </span>
                  </div>
                  <div className="admin-meta-grid">
                    <button
                      className="admin-copy"
                      type="button"
                      onClick={() => copyUid(ban.id)}
                    >
                      UID {ban.id.slice(0, 8)}
                    </button>
                    <span>
                      <strong>By</strong>
                      {ban.createdByUid?.slice(0, 8) || "Unknown"}
                    </span>
                    <span>
                      <strong>When</strong>
                      {formatDate(ban.createdAt)}
                    </span>
                  </div>
                  <p className="moderation-note">Reason: {ban.reason}</p>
                  <div className="line-actions admin-action-row">
                    <button
                      className="action-button action-button--primary"
                      type="button"
                      disabled={actionId === ban.id}
                      onClick={() => handleUnban(ban.id)}
                    >
                      Unban
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <article className="section-card">
              <p className="empty-state">No matching banned users.</p>
            </article>
          )}

          {hasMoreBans ? (
            <div className="admin-load-row">
              <button
                className="action-button"
                type="button"
                disabled={loadingMore === "bans"}
                onClick={loadMoreBans}
              >
                {loadingMore === "bans" ? "Loading..." : "Load more bans"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default AdminPage;
