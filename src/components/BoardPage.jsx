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
          <label className="filter-pill" htmlFor="category-filter">
            <span>Topic</span>
            <select
              id="category-filter"
              value={filter}
              onChange={(event) => onFilterChange(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="page-panel">
        <BoardSection
          canVote={Boolean(user) && activeRoute === "lines"}
          emptyMessage={
            activeRoute === "promoted"
              ? "No top picks yet."
              : "Nothing to explore yet."
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
