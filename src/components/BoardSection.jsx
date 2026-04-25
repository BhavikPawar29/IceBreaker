import { useEffect, useRef } from "react";
import LineCard from "./LineCard";

function BoardSection({
  canVote,
  emptyMessage,
  hasMore,
  isBoardLoading,
  isFetchingMore,
  lines,
  onLoadMore,
  onVote,
  votes,
}) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!hasMore || isBoardLoading || isFetchingMore) {
      return undefined;
    }

    const currentSentinel = sentinelRef.current;

    if (!currentSentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        rootMargin: "300px 0px",
      },
    );

    observer.observe(currentSentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isBoardLoading, isFetchingMore, onLoadMore]);

  return (
    <div className="board-grid" aria-live="polite">
      {isBoardLoading ? (
        <article className="section-card board-empty">
          <p className="empty-state">Finding good ideas for you...</p>
        </article>
      ) : null}

      {!isBoardLoading && !lines.length ? (
        <article className="section-card board-empty">
          <p className="empty-state">{emptyMessage}</p>
        </article>
      ) : null}

      {lines.map((line, index) => (
        <LineCard
          canVote={canVote}
          key={line.id}
          line={line}
          rank={index + 1}
          voteState={votes[line.id] || 0}
          onVote={onVote}
        />
      ))}

      {!isBoardLoading && lines.length ? (
        <div className="board-pagination" ref={sentinelRef}>
          {isFetchingMore ? (
            <p className="empty-state">Loading more ideas...</p>
          ) : hasMore ? (
            <p className="empty-state">Scroll to load more</p>
          ) : (
            <p className="empty-state">You reached the end</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default BoardSection;
