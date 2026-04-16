import { formatCategory } from "../utils/board";

function SectionHeader({ categories, filter, onFilterChange }) {
  return (
    <section className="section-head" id="leaderboard">
      <div>
        <p className="eyebrow">Community leaderboard</p>
        <h2>Top-ranked lines, sorted by net votes.</h2>
      </div>

      <label className="filter-pill" htmlFor="category-filter">
        <span>Filter</span>
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
    </section>
  );
}

export default SectionHeader;
