import SubmitCard from "./SubmitCard";

function CreatePage({
  authEnabled,
  banReason,
  isBanned,
  lookupExistingLine,
  onSubmit,
  user,
}) {
  return (
    <section className="app-page create-page">
      <div className="page-copy create-copy">
        <p className="eyebrow">Share one</p>
        <h2>Share a line people can actually use.</h2>
        <p className="page-description">
          One sentence is enough. Keep it natural and specific.
        </p>
        {isBanned ? (
          <p className="page-description">
            Posting is disabled on this account.
            {banReason ? ` Reason: ${banReason}.` : ""}
          </p>
        ) : null}
      </div>
      <div className="page-panel create-shell create-panel">
        <SubmitCard
          authEnabled={authEnabled}
          banReason={banReason}
          isBanned={isBanned}
          lookupExistingLine={lookupExistingLine}
          onSubmit={onSubmit}
          user={user}
        />
      </div>
    </section>
  );
}

export default CreatePage;
