import { Link } from "react-router-dom";
import { formatCategory } from "../utils/board";
import RouteShimmer from "./RouteShimmer";
import StatePanel from "./StatePanel";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function PublicProfilePage({ lines, profileId }) {
  if (lines === undefined) {
    return (
      <section className="main-shell">
        <article
          className="section-card route-skeleton-card"
          aria-live="polite"
        >
          <RouteShimmer />
        </article>
      </section>
    );
  }

  const sharedCount = lines.length;

  async function handleShareProfile() {
    const shareRuntime = getShareRuntime();
    await shareRuntime?.shareUrl(
      shareRuntime.buildAbsoluteUrl(`/profile/${profileId}`),
      "Anonymous IceBreaker profile",
    );
  }

  return (
    <section className="main-shell">
      <section className="app-page">
        <article className="section-card public-profile-hero">
          <div className="page-copy">
            <p className="eyebrow">Shared by the community</p>
            <h2>Anonymous contributor ideas</h2>
            <p className="page-description">
              A small collection of conversation ideas this contributor has
              added to IceBreaker.
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
            <StatePanel
              className="section-card"
              eyebrow="Quiet profile"
              message="This contributor has not posted an approved line to the board yet."
              title="Nothing has been shared here yet."
              variant="empty"
            />
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
                  onClick={() => {
                    const shareRuntime = getShareRuntime();
                    return shareRuntime?.shareUrl(
                      shareRuntime.buildAbsoluteUrl(`/line/${line.id}`),
                      "IceBreaker idea",
                    );
                  }}
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
