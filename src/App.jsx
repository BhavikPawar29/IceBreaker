import { useState } from "react";
import Hero from "./components/Hero";
import StoryStrip from "./components/StoryStrip";
import BoardSection from "./components/BoardSection";
import ApprovedShowcase from "./components/ApprovedShowcase";
import { firebaseConfigReady } from "./lib/firebase";
import useAuth from "./context/useAuth";
import useCommunityBoard from "./hooks/useCommunityBoard";

function App() {
  const [filter, setFilter] = useState("all");
  const { authEnabled, isAuthReady, signInWithGoogle, signOutUser, user } =
    useAuth();
  const {
    approvedLines,
    boardError,
    candidateLines,
    isApprovedLoading,
    isBoardLoading,
    lookupExistingLine,
    submitLine,
    votes,
    voteOnLine,
  } = useCommunityBoard(user);
  const safeCandidateLines = Array.isArray(candidateLines)
    ? candidateLines
    : [];
  const safeApprovedLines = Array.isArray(approvedLines) ? approvedLines : [];

  const categories = [
    ...new Set(safeCandidateLines.map((line) => line.category)),
  ];
  const filteredLines = safeCandidateLines.filter(
    (line) => filter === "all" || line.category === filter,
  );
  const topLine = filteredLines[0] ?? null;
  const stats = {
    approvedCount: safeApprovedLines.length,
    total: safeCandidateLines.length + safeApprovedLines.length,
    topScore: topLine ? topLine.score : 0,
    candidateCount: safeCandidateLines.length,
  };

  return (
    <div className="page-shell">
      <div className="paper-grain" aria-hidden="true"></div>
      <Hero
        authEnabled={authEnabled}
        isAuthReady={isAuthReady}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
        stats={stats}
        user={user}
      />
      <main>
        {!firebaseConfigReady ? (
          <section className="status-banner">
            Add your Firebase web config to <code>.env</code> to enable Google
            sign-in and Firestore syncing. The current board is showing local
            seed data until that is configured.
          </section>
        ) : null}
        {boardError ? (
          <section className="status-banner status-banner--error">
            {boardError}
          </section>
        ) : null}
        <StoryStrip />
        <BoardSection
          authEnabled={authEnabled}
          approvedLines={safeApprovedLines}
          categories={categories}
          currentVotes={votes}
          filter={filter}
          isApprovedLoading={isApprovedLoading}
          isBoardLoading={isBoardLoading}
          lines={filteredLines}
          lookupExistingLine={lookupExistingLine}
          onFilterChange={setFilter}
          onSubmit={submitLine}
          onVote={voteOnLine}
          user={user}
        />
        <ApprovedShowcase
          approvedLines={safeApprovedLines}
          isApprovedLoading={isApprovedLoading}
        />
      </main>
    </div>
  );
}

export default App;
