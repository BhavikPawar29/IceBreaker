import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatCategory } from "../formatters";

function getShareRuntime() {
  return globalThis.__ICEBREAKER_SHARE__;
}

function LineCard({ canVote, line, rank, voteState, onVote }) {
  const [isSaving, setIsSaving] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState(voteState || 0);
  const [optimisticUpvoteCount, setOptimisticUpvoteCount] = useState(
    line.upvoteCount || 0,
  );
  const requestInFlightRef = useRef(false);
  const queuedVoteRef = useRef(null);
  const committedVoteRef = useRef(voteState || 0);
  const committedCountRef = useRef(line.upvoteCount || 0);

  useEffect(
    function syncOptimisticVoteFromServer() {
      if (isSaving) {
        return;
      }

      const nextVote = voteState || 0;
      committedVoteRef.current = nextVote;
      setOptimisticVote(nextVote);
    },
    [isSaving, voteState],
  );

  useEffect(
    function syncOptimisticCountFromServer() {
      if (isSaving) {
        return;
      }

      const nextCount = line.upvoteCount || 0;
      committedCountRef.current = nextCount;
      setOptimisticUpvoteCount(nextCount);
    },
    [isSaving, line.upvoteCount],
  );

  async function handleShare() {
    const shareRuntime = getShareRuntime();
    const shareUrl = shareRuntime?.buildShareUrl(`/line/${line.id}`, {
      surface: "line_card",
      targetPath: `/line/${line.id}`,
      type: "line",
    });

    await shareRuntime?.shareUrl({
      shareSurface: "line_card",
      shareType: "line",
      text: `This IceBreaker line is actually usable:\n\n"${line.text}"\n\nTry more here:`,
      title: "Breaking Ice",
      url: shareUrl,
    });
  }

  async function flushVoteToTarget(targetVote) {
    if (targetVote === committedVoteRef.current) {
      return;
    }

    requestInFlightRef.current = true;
    setIsSaving(true);

    const previousCommittedVote = committedVoteRef.current;
    const previousCommittedCount = committedCountRef.current;
    const result = await onVote(line.id);

    if (result?.ok) {
      const nextCommittedVote = previousCommittedVote === 1 ? 0 : 1;
      const nextCommittedCount = Math.max(
        0,
        previousCommittedCount + (nextCommittedVote === 1 ? 1 : -1),
      );
      committedVoteRef.current = nextCommittedVote;
      committedCountRef.current = nextCommittedCount;
    } else {
      setOptimisticVote(committedVoteRef.current);
      setOptimisticUpvoteCount(committedCountRef.current);
    }

    requestInFlightRef.current = false;
    setIsSaving(false);

    const queuedVote = queuedVoteRef.current;
    queuedVoteRef.current = null;

    if (queuedVote !== null && queuedVote !== committedVoteRef.current) {
      await flushVoteToTarget(queuedVote);
    }
  }

  async function handleVote() {
    if (!canVote) {
      return;
    }

    const nextVote = optimisticVote === 1 ? 0 : 1;
    const nextCount = Math.max(
      0,
      optimisticUpvoteCount + (nextVote === 1 ? 1 : -1),
    );
    setOptimisticVote(nextVote);
    setOptimisticUpvoteCount(nextCount);

    if (requestInFlightRef.current) {
      queuedVoteRef.current = nextVote;
      return;
    }

    await flushVoteToTarget(nextVote);
  }

  return (
    <article className="section-card line-card">
      <div className="line-meta">
        <span className="line-rank">#{rank}</span>
        <div className="line-badges">
          <span className="category-chip">{formatCategory(line.category)}</span>
          {line.promoted ? (
            <span className="score-chip">Top pick</span>
          ) : (
            <span className="score-chip">Still getting votes</span>
          )}
        </div>
      </div>
      <p className="line-body">{line.text}</p>
      <div className="line-footer">
        <div className="line-footer-left">
          <div className="line-author">Shared anonymously</div>
          <div className="line-actions">
            <Link
              className="action-link action-link--primary"
              to={`/line/${line.id}`}
            >
              Open idea
            </Link>
            <Link className="action-link" to={`/profile/${line.createdByUid}`}>
              View author
            </Link>
            <button
              className="action-button"
              type="button"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
        </div>

        <div className="line-footer-right">
          <span className="mini-stat">
            <strong>{optimisticUpvoteCount}</strong>
            saves
          </span>
          {line.promoted ? (
            <span className="mini-stat">
              <strong>{line.promotionScore || line.score}</strong>
              hit the mark
            </span>
          ) : (
            <div className="vote-panel">
              <button
                className={`vote-button ${optimisticVote === 1 ? "is-active" : ""}`}
                type="button"
                aria-label={
                  optimisticVote === 1 ? "Remove upvote" : "Upvote line"
                }
                aria-pressed={optimisticVote === 1}
                disabled={!canVote}
                aria-busy={isSaving}
                onClick={handleVote}
                title={canVote ? "Upvote this idea" : "Sign in to vote"}
              >
                <span className="vote-button__arrow" aria-hidden="true">
                  ↑
                </span>
                <span>{optimisticVote === 1 ? "Upvoted" : "Upvote"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default LineCard;
