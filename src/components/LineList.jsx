import LineCard from "./LineCard";

function LineList({ lines, votes, onVote }) {
  return (
    <div className="section-card">
      <div className="card-heading">
        <p className="eyebrow">Full board</p>
        <h3>Vote on every submission</h3>
      </div>

      <div className="line-list" aria-live="polite">
        {lines.map((line, index) => (
          <LineCard
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
