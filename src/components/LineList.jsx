import LineCard from "./LineCard";

function LineList({
  canVote,
  hasApprovedLines,
  isApprovedLoading,
  isBoardLoading,
  lines,
  votes,
  onVote,
}) {
  return (
    <div className="section-card">
      <div className="card-heading">
        <p className="eyebrow">Full board</p>
        <h3>Vote on every submission</h3>
      </div>

      <div className="line-list" aria-live="polite">
        {isBoardLoading ? (
          <p className="empty-state">Loading lines from Firestore...</p>
        ) : null}
        {!isBoardLoading && !lines.length ? (
          <p className="empty-state">
            {hasApprovedLines && !isApprovedLoading
              ? "No candidate lines are left right now. Check the approved showcase below."
              : "No candidate lines have been published yet."}
          </p>
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
      </div>
    </div>
  );
}

export default LineList;
