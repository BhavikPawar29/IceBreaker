import { Link } from "react-router-dom";
import BoardSection from "./BoardSection";
import useIsMobile from "../hooks/useIsMobile";
import { formatCategory } from "../utils/board";

function BoardPage({
  activeRoute,
  categories,
  filter,
  hasMore,
  isBoardLoading,
  isFetchingMore,
  lines,
  onLoadMore,
  onFilterChange,
  onVote,
  user,
  votes,
}) {
  const isMobile = useIsMobile();
  const topCategories = categories
    .filter((category) => category !== "all")
    .slice(0, 5);

  return (
    <section className="app-page">
      <div className={`page-head ${isMobile ? "page-head--mobile" : ""}`}>
        <div className="page-copy">
          <h2>{activeRoute === "promoted" ? "Top picks" : "Explore ideas"}</h2>
          <p className="page-description">
            {activeRoute === "promoted"
              ? "These are the ideas people kept coming back to, voting up, and saving."
              : "Browse what people are trying, vote on what feels useful, or open one to share it."}
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
              onClick={() => onFilterChange("all")}
            >
              All
            </button>
            {topCategories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-filter-chip ${filter === category ? "is-active" : ""}`}
                onClick={() => onFilterChange(category)}
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
              ? "No top picks yet. Votes from Explore will promote ideas here."
              : "No ideas in this filter yet. Try another topic or add your own."
          }
          hasMore={hasMore}
          isBoardLoading={isBoardLoading}
          isFetchingMore={isFetchingMore}
          lines={lines}
          onLoadMore={onLoadMore}
          onVote={onVote}
          votes={votes}
        />
      </div>
    </section>
  );
}

export default BoardPage;
