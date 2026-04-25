import { useState } from "react";
import { formatCategory } from "../utils/board";

function AdminPage({ isLoading, lines, onModerate }) {
  const [reasons, setReasons] = useState({});
  const [message, setMessage] = useState("");
  const [pendingActionId, setPendingActionId] = useState("");

  function updateReason(lineId, value) {
    setReasons((currentReasons) => ({
      ...currentReasons,
      [lineId]: value,
    }));
  }

  async function handleModeration(lineId, nextStatus) {
    setPendingActionId(lineId);
    setMessage("");

    const result = await onModerate(lineId, nextStatus, reasons[lineId] || "");

    setPendingActionId("");
    setMessage(result.message);

    if (result.ok) {
      setReasons((currentReasons) => ({
        ...currentReasons,
        [lineId]: "",
      }));
    }
  }

  return (
    <section className="app-page">
      <div className="page-head">
        <div className="page-copy">
          <p className="eyebrow">Admin review</p>
          <h2>Pending ideas</h2>
          <p className="page-description">
            Approve what belongs on the board and reject what should stay out.
          </p>
        </div>
      </div>

      {message ? (
        <article className="section-card">
          <p className="form-note">{message}</p>
        </article>
      ) : null}

      <div className="profile-list">
        {isLoading ? (
          <article className="section-card">
            <p className="empty-state">Loading pending ideas...</p>
          </article>
        ) : null}

        {!isLoading && !lines.length ? (
          <article className="section-card">
            <p className="empty-state">No pending ideas right now.</p>
          </article>
        ) : null}

        {lines.map((line) => (
          <article key={line.id} className="section-card moderation-card">
            <div className="line-badges">
              <span className="category-chip">
                {formatCategory(line.category)}
              </span>
              <span className="status-chip status-chip--pending">
                Pending review
              </span>
            </div>
            <p className="line-body">{line.text}</p>
            <p className="line-author">
              Shared by {line.createdByName || "community member"}
            </p>
            <label className="submission-form moderation-form">
              <span>Rejection reason (optional)</span>
              <textarea
                rows="3"
                maxLength="200"
                placeholder="Tell the submitter why this does not fit the board."
                value={reasons[line.id] || ""}
                onChange={(event) => updateReason(line.id, event.target.value)}
              />
            </label>
            <div className="line-actions">
              <button
                className="action-button action-button--primary"
                type="button"
                disabled={pendingActionId === line.id}
                onClick={() => handleModeration(line.id, "approved")}
              >
                Approve
              </button>
              <button
                className="action-button"
                type="button"
                disabled={pendingActionId === line.id}
                onClick={() => handleModeration(line.id, "rejected")}
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminPage;
