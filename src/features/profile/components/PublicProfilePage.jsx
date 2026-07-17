import { Link } from "react-router-dom";
import { safeTrackEvent } from "../../../shared/core/analytics";
import { buildLoginHref } from "../../../shared/core/shareFlow";
import RouteShimmer from "../../../shared/ui/RouteShimmer";
import Seo from "../../../shared/ui/Seo";
import StatePanel from "../../../shared/ui/StatePanel";
import { formatCategory } from "../../board/formatters";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function buildProfileDescription(lines) {
  if (!lines.length) {
    return "Anonymous contributor ideas shared on Breaking Ice.";
  }

  const preview = lines
    .slice(0, 2)
    .map((line) => line.text?.trim())
    .filter(Boolean)
    .join(" ");

  if (!preview) {
    return "Anonymous contributor ideas shared on Breaking Ice.";
  }

  if (preview.length <= 150) {
    return preview;
  }

  return `${preview.slice(0, 147).trimEnd()}...`;
}

function PublicProfilePage({ lines, profileId, user }) {
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
    const shareUrl = shareRuntime?.buildShareUrl(`/profile/${profileId}`, {
      surface: "public_profile",
      targetPath: `/profile/${profileId}`,
      type: "profile",
    });

    await shareRuntime?.shareUrl({
      shareSurface: "public_profile",
      shareType: "profile",
      text: "A few conversation starters from Breaking Ice. Try more here:",
      title: "Breaking Ice",
      url: shareUrl,
    });
  }

  return (
    <section className="main-shell">
      <section className="app-page">
        <Seo
          canonicalPath={`/profile/${profileId}`}
          description={buildProfileDescription(lines)}
          title={`Anonymous Contributor Ideas (${sharedCount}) | Breaking Ice`}
          type="profile"
        />
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
        {!user ? (
          <article className="section-card share-cta-card share-cta-card--page">
            <p className="eyebrow">Found through a share?</p>
            <h3>Try live mode and get one good line fast.</h3>
            <p>
              Pick the moment, skip the cringe list, and get something natural
              to say right now.
            </p>
            <div className="line-actions">
              <Link
                className="action-link action-link--primary"
                to={buildLoginHref({
                  surface: "public_profile_cta",
                  targetPath: `/profile/${profileId}`,
                  type: "signup",
                })}
                onClick={() =>
                  safeTrackEvent("cta_clicked", {
                    cta_location: "public_profile_share_page",
                    cta_name: "try_live_mode",
                    destination: "/login",
                  })
                }
              >
                Try live mode
              </Link>
              <Link className="action-link" to="/">
                See how it works
              </Link>
            </div>
          </article>
        ) : null}

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
                    const shareUrl = shareRuntime?.buildShareUrl(
                      `/line/${line.id}`,
                      {
                        surface: "public_profile_line",
                        targetPath: `/line/${line.id}`,
                        type: "line",
                      },
                    );

                    return shareRuntime?.shareUrl({
                      shareSurface: "public_profile_line",
                      shareType: "line",
                      text: `This IceBreaker line is actually usable:\n\n"${line.text}"\n\nTry more here:`,
                      title: "Breaking Ice",
                      url: shareUrl,
                    });
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
