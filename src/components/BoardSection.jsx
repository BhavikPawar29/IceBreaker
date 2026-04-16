import SectionHeader from "./SectionHeader";
import FeaturedLine from "./FeaturedLine";
import LineList from "./LineList";
import GuideCard from "./GuideCard";
import SubmitCard from "./SubmitCard";

function BoardSection({
  categories,
  currentVotes,
  filter,
  lines,
  onFilterChange,
  onSubmit,
  onVote,
}) {
  return (
    <>
      <SectionHeader
        categories={categories}
        filter={filter}
        onFilterChange={onFilterChange}
      />

      <section className="board-layout">
        <div className="leader-column">
          <FeaturedLine line={lines[0] ?? null} />
          <LineList lines={lines} votes={currentVotes} onVote={onVote} />
        </div>

        <aside className="side-column">
          <GuideCard />
          <SubmitCard categories={categories} onSubmit={onSubmit} />
        </aside>
      </section>
    </>
  );
}

export default BoardSection;
