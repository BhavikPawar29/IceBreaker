import { Link } from "react-router-dom";
import BoardSection from "./BoardSection";
import useIsMobile from "../../../shared/core/useIsMobile";
import { formatCategory } from "../formatters";

function BoardPage({
  activeRoute,
  categories,
  currentPage,
  filter,
  hasMore,
  isBoardLoading,
  isFetchingMore,
  lines,
  onLoadMore,
  onPageChange,
  onFilterChange,
  onVote,
  user,
  votes,
}) {
  const isMobile = useIsMobile();
  const topCategories = categories
    .filter((category) => category !== "all")
    .slice(0, 5);

  function changeFilter(nextFilter) {
    onFilterChange(nextFilter);
    onPageChange(1);
  }

  return (
    <section className="app-page">
      <div
        className={`page-head board-page-head ${
          isMobile ? "page-head--mobile" : ""
        }`}
      >
        <div className="page-copy">
          <h2>
            {activeRoute === "promoted"
              ? "Lines people came back to"
              : "Find a little line worth trying"}
          </h2>
          <p className="page-description">
            {activeRoute === "promoted"
              ? "The prompts people saved because they felt usable in a real moment."
              : "Browse gently. The next sentence might be the one you needed."}
          </p>
        </div>
        <div
          className={`page-actions page-actions--board ${
            isMobile ? "page-actions--board-mobile" : ""
          }`}
        >
          <div className="category-chip-row" aria-label="Quick categories">
            <button
              type="button"
              className={`category-filter-chip ${filter === "all" ? "is-active" : ""}`}
              onClick={() => changeFilter("all")}
            >
              All
            </button>
            {topCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-filter-chip ${filter === category ? "is-active" : ""}`}
                onClick={() => changeFilter(category)}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-panel">
        <BoardSection
          canVote={Boolean(user) && activeRoute === "lines"}
          currentPage={currentPage}
          emptyActions={
            activeRoute === "promoted" ? (
              <>
                <Link className="action-link action-link--primary" to="/lines">
                  Explore live queue
                </Link>
                <Link className="action-link" to="/create">
                  Share your first idea
                </Link>
              </>
            ) : (
              <Link className="action-link action-link--primary" to="/create">
                Share your first idea
              </Link>
            )
          }
          emptyMessage={
            activeRoute === "promoted"
              ? "No top picks yet. Saves from Explore will bring the strongest lines here."
              : "No ideas in this filter yet. Try another topic or pass a little one on."
          }
          hasMore={hasMore}
          isBoardLoading={isBoardLoading}
          isFetchingMore={isFetchingMore}
          lines={lines}
          onLoadMore={onLoadMore}
          onPageChange={onPageChange}
          onVote={onVote}
          votes={votes}
        />
      </div>
    </section>
  );
}

export default BoardPage;
