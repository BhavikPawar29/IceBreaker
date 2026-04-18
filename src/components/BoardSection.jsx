import SectionHeader from "./SectionHeader";
import FeaturedLine from "./FeaturedLine";
import LineList from "./LineList";
import GuideCard from "./GuideCard";
import SubmitCard from "./SubmitCard";

function BoardSection({
  authEnabled,
  approvedLines,
  categories,
  currentVotes,
  filter,
  isApprovedLoading,
  isBoardLoading,
  lines,
  lookupExistingLine,
  onFilterChange,
  onSubmit,
  onVote,
  user,
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
          <LineList
            canVote={Boolean(user)}
            hasApprovedLines={approvedLines.length > 0}
            isApprovedLoading={isApprovedLoading}
            isBoardLoading={isBoardLoading}
            lines={lines}
            votes={currentVotes}
            onVote={onVote}
          />
        </div>

        <aside className="side-column">
          <GuideCard />
          <SubmitCard
            authEnabled={authEnabled}
            categories={categories}
            lookupExistingLine={lookupExistingLine}
            onSubmit={onSubmit}
            user={user}
          />
        </aside>
      </section>
    </>
  );
}

export default BoardSection;
