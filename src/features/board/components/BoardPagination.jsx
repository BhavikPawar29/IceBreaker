function PaginationArrow({ direction }) {
  const isPrevious = direction === "previous";

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path
        d={isPrevious ? "m11.5 4-6 6 6 6" : "m8.5 4 6 6-6 6"}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BoardPagination({
  currentPage,
  hasMore,
  isLoading,
  pageCount,
  onPageChange,
}) {
  const firstUnloadedPage = pageCount === 1 && hasMore ? 2 : null;
  const finalPage = hasMore ? null : pageCount;
  const pageItems = Array.from(
    new Set(
      [
        1,
        2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        finalPage,
        firstUnloadedPage,
      ]
        .filter(
          (page) =>
            page &&
            page > 0 &&
            (page <= pageCount || page === firstUnloadedPage),
        )
        .sort((firstPage, secondPage) => firstPage - secondPage),
    ),
  );

  return (
    <nav className="board-pagination" aria-label="Idea pages">
      <button
        className="board-pagination__button"
        type="button"
        aria-label="Previous page"
        disabled={currentPage === 1 || isLoading}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <PaginationArrow direction="previous" />
      </button>

      {pageItems.map((page, index) => {
        const previousPage = pageItems[index - 1];
        const needsEllipsis = previousPage && page - previousPage > 1;

        return (
          <span className="board-pagination__group" key={page}>
            {needsEllipsis ? (
              <span className="board-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            ) : null}
            <button
              className={`board-pagination__button ${
                page === currentPage ? "is-active" : ""
              }`}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              disabled={isLoading}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        );
      })}

      {hasMore ? (
        <span className="board-pagination__ellipsis" aria-hidden="true">
          …
        </span>
      ) : null}

      <button
        className="board-pagination__button"
        type="button"
        aria-label="Next page"
        disabled={(!hasMore && currentPage === pageCount) || isLoading}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <PaginationArrow direction="next" />
      </button>
    </nav>
  );
}

export default BoardPagination;
