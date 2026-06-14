import { Link } from "react-router-dom";
import { formatCategory, formatLineStatus } from "../utils/board";
import {
  LINE_STATUS_APPROVED,
  LINE_STATUS_PENDING,
} from "../constants/lineStatuses";
import Seo from "./Seo";
import { safeTrackEvent } from "../utils/analytics";
import { buildLoginHref } from "../utils/shareFlow";
import RouteShimmer from "./RouteShimmer";
import StatePanel from "./StatePanel";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function buildLineDescription(line) {
  const rawText =
    line?.text?.trim() ||
    "A public conversation idea from the Breaking Ice community.";

  if (rawText.length <= 150) {
    return rawText;
  }

  return `${rawText.slice(0, 147).trimEnd()}...`;
}

function buildLineTitle(line) {
  const rawText = line?.text?.trim() || "Conversation Idea";

  if (rawText.length <= 60) {
    return `${rawText} | Breaking Ice`;
  }

  return `${rawText.slice(0, 57).trimEnd()}... | Breaking Ice`;
}

function LineDetailPage({ line, user }) {
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
    const shareUrl = shareRuntime?.buildShareUrl(`/line/${line.id}`, {
      surface: "line_detail",
      targetPath: `/line/${line.id}`,
      type: "line",
    });

    await shareRuntime?.shareUrl({
      shareSurface: "line_detail",
      shareType: "line",
      text: `This IceBreaker line is actually usable:\n\n"${line.text}"\n\nTry more here:`,
      title: "Breaking Ice",
      url: shareUrl,
    });
  }

  return (
    <section className="main-shell">
      <Seo
        canonicalPath={`/line/${line.id}`}
        description={buildLineDescription(line)}
        robots={
          line.status === LINE_STATUS_APPROVED
            ? "index,follow"
            : "noindex,nofollow"
        }
        title={buildLineTitle(line)}
        type="article"
      />
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
        {!user ? (
          <article className="share-cta-card">
            <p className="eyebrow">Found through a share?</p>
            <h3>Get your own line before the moment goes weird.</h3>
            <p>
              Open live mode, pick the situation, and get one natural thing to
              say in seconds.
            </p>
            <div className="line-actions">
              <Link
                className="action-link action-link--primary"
                to={buildLoginHref({
                  surface: "line_detail_cta",
                  targetPath: `/line/${line.id}`,
                  type: "signup",
                })}
                onClick={() =>
                  safeTrackEvent("cta_clicked", {
                    cta_location: "line_detail_share_page",
                    cta_name: "get_your_own_line",
                    destination: "/login",
                  })
                }
              >
                Get your own line
              </Link>
              <Link className="action-link" to="/">
                See how it works
              </Link>
            </div>
          </article>
        ) : null}
      </article>
    </section>
  );
}

export default LineDetailPage;
