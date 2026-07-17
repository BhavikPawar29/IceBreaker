import { useEffect } from "react";
import BoardPagination from "./BoardPagination";
import LineCard from "./LineCard";
import RouteShimmer from "../../../shared/ui/RouteShimmer";

const PAGE_SIZE = 10;

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function BoardSection({
  canVote,
  currentPage,
  emptyActions = null,
  emptyMessage,
  hasMore,
  isBoardLoading,
  isFetchingMore,
  lines,
  onLoadMore,
  onPageChange,
  onVote,
  votes,
}) {
  const pageCount = Math.max(1, Math.ceil(lines.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, pageCount);
  const visibleLines = lines.slice(
    (activePage - 1) * PAGE_SIZE,
    activePage * PAGE_SIZE,
  );

  useEffect(
    function restoreSavedPage() {
      if (
        !isBoardLoading &&
        !isFetchingMore &&
        currentPage > pageCount &&
        hasMore
      ) {
        onLoadMore();
      }

      if (!isBoardLoading && !hasMore && currentPage > pageCount) {
        onPageChange(pageCount);
      }
    },
    [
      currentPage,
      hasMore,
      isBoardLoading,
      isFetchingMore,
      onLoadMore,
      onPageChange,
      pageCount,
    ],
  );

  async function goToPage(nextPage) {
    if (nextPage === activePage || isFetchingMore) {
      return;
    }

    if (nextPage <= pageCount) {
      onPageChange(nextPage);
      scrollToTop();
      return;
    }

    if (hasMore && nextPage === pageCount + 1) {
      await onLoadMore();
      onPageChange(nextPage);
      scrollToTop();
    }
  }

  return (
    <div className="board-grid" aria-live="polite">
      {isBoardLoading ? (
        <article
          className="section-card board-empty route-skeleton-card"
          aria-live="polite"
        >
          <RouteShimmer />
        </article>
      ) : null}

      {!isBoardLoading && !lines.length ? (
        <article className="section-card board-empty">
          <p className="empty-state">{emptyMessage}</p>
          {emptyActions ? (
            <div className="empty-actions">{emptyActions}</div>
          ) : null}
        </article>
      ) : null}

      {visibleLines.map((line, index) => (
        <LineCard
          canVote={canVote}
          key={line.id}
          line={line}
          rank={(activePage - 1) * PAGE_SIZE + index + 1}
          voteState={votes[line.id] || 0}
          onVote={onVote}
        />
      ))}

      {!isBoardLoading && lines.length && (pageCount > 1 || hasMore) ? (
        <BoardPagination
          currentPage={activePage}
          hasMore={hasMore}
          isLoading={isFetchingMore}
          pageCount={pageCount}
          onPageChange={goToPage}
        />
      ) : null}
    </div>
  );
}

export default BoardSection;
