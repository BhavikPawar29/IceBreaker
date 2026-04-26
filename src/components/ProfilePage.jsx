import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import { formatCategory, formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
  LINE_STATUS_REJECTED,
} from "../constants/lineStatuses";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  normalizeDisplayName,
  validateDisplayName,
} from "../utils/profileValidation";
import Snackbar from "./Snackbar";

function ProfilePage({ lines, onUpdateDisplayName, user }) {
  const isMobile = useIsMobile();
  const [draftName, setDraftName] = useState(user.displayName || "");
  const [profileNote, setProfileNote] = useState("");
  const [feedback, setFeedback] = useState({ message: "", tone: "info" });
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    setDraftName(user.displayName || "");
  }, [user.displayName]);

  function showFeedback(message, tone = "info") {
    setFeedback({ message, tone });
  }

  async function handleDisplayNameSubmit(event) {
    event.preventDefault();
    const normalizedName = normalizeDisplayName(draftName);
    const validationMessage = validateDisplayName(normalizedName);

    if (validationMessage) {
      setProfileNote(validationMessage);
      showFeedback(validationMessage, "warning");
      return;
    }

    if (normalizedName === (user.displayName || "")) {
      const message = "That name is already on your profile.";
      setProfileNote(message);
      showFeedback(message, "info");
      return;
    }

    setIsSavingName(true);
    setProfileNote("");

    try {
      await onUpdateDisplayName(normalizedName);
      setDraftName(normalizedName);
      setProfileNote("Name updated across your profile and submitted ideas.");
      showFeedback("Name updated.", "success");
    } catch (error) {
      const message =
        error?.message ||
        "We could not update your name right now. Please try again in a moment.";
      setProfileNote(message);
      showFeedback(message, "warning");
    } finally {
      setIsSavingName(false);
    }
  }

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
            <h3>{user.displayName || "Community member"}</h3>
            <p className="profile-identity-meta">
              {user.email || "Signed in member"}
            </p>
            <p className="profile-identity-note">
              Track what you shared, what is still in review, and which ideas
              made it through.
            </p>
            <form
              className="profile-settings-form"
              onSubmit={handleDisplayNameSubmit}
            >
              <label>
                <span>Change display name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  minLength={DISPLAY_NAME_MIN_LENGTH}
                  maxLength={DISPLAY_NAME_MAX_LENGTH}
                  placeholder="Use a clean public name"
                />
                <small className="field-hint">
                  Use {DISPLAY_NAME_MIN_LENGTH}-{DISPLAY_NAME_MAX_LENGTH} clean
                  characters. No handles, admin labels, or weird spammy names.
                </small>
              </label>
              <button
                className="ghost-link profile-save-button"
                type="submit"
                disabled={isSavingName}
              >
                {isSavingName ? "Saving..." : "Update name"}
              </button>
            </form>
            {profileNote ? (
              <p className="form-note profile-note">{profileNote}</p>
            ) : null}
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
      <Snackbar
        isVisible={Boolean(feedback.message)}
        message={feedback.message}
        tone={feedback.tone}
      />
    </section>
  );
}

export default ProfilePage;
