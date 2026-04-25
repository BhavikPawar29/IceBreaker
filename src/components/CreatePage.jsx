import SubmitCard from "./SubmitCard";

function CreatePage({ authEnabled, lookupExistingLine, onSubmit, user }) {
  return (
    <section className="app-page create-page">
      <div className="page-copy create-copy">
        <p className="eyebrow">Share one</p>
        <h2>Add something worth sending to a shy friend.</h2>
        <p className="page-description">
          Keep it natural, specific, and easy to actually say. Good ideas go
          into review before they reach the board.
        </p>
      </div>
      <div className="page-panel create-shell create-panel">
        <SubmitCard
          authEnabled={authEnabled}
          lookupExistingLine={lookupExistingLine}
          onSubmit={onSubmit}
          user={user}
        />
      </div>
    </section>
  );
}

export default CreatePage;
