import { Link } from "react-router-dom";
import { formatCategory } from "../utils/board";
import { buildAbsoluteUrl, shareUrl } from "../utils/share";

function PublicProfilePage({ lines, profileId }) {
  const displayName = lines[0]?.createdByName || "Community member";
  const sharedCount = lines.length;

  async function handleShareProfile() {
    await shareUrl(
      buildAbsoluteUrl(`/profile/${profileId}`),
      `${displayName}'s IceBreaker profile`,
    );
  }

  return (
    <section className="main-shell">
      <section className="app-page">
        <article className="section-card public-profile-hero">
          <div className="page-copy">
            <p className="eyebrow">Shared by the community</p>
            <h2>{displayName}&apos;s ideas</h2>
            <p className="page-description">
              A small collection of conversation ideas this person has added to
              IceBreaker.
            </p>
          </div>
          <div className="page-actions">
            <div className="page-summary">
              <strong>{sharedCount}</strong>
              <span>shared ideas</span>
            </div>
            <button
              className="ghost-link"
              type="button"
              onClick={handleShareProfile}
            >
              Share profile
            </button>
          </div>
        </article>

        <div className="profile-list">
          {!lines.length ? (
            <article className="section-card">
              <p className="empty-state">Nothing has been shared here yet.</p>
            </article>
          ) : null}
          {lines.map((line) => (
            <article key={line.id} className="section-card profile-line">
              <div className="line-badges">
                <span className="category-chip">
                  {formatCategory(line.category)}
                </span>
                <span className="score-chip">
                  {line.promoted ? "Top pick" : "Still getting votes"}
                </span>
              </div>
              <p>{line.text}</p>
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
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default PublicProfilePage;
