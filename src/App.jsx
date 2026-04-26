import { useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AppHeader from "./components/AppHeader";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import BoardPage from "./components/BoardPage";
import CreatePage from "./components/CreatePage";
import LandingPage from "./components/LandingPage";
import LineDetailPage from "./components/LineDetailPage";
import LoginPage from "./components/LoginPage";
import ProfilePage from "./components/ProfilePage";
import PublicProfilePage from "./components/PublicProfilePage";
import AdminPage from "./components/AdminPage";
import { firebaseConfigReady } from "./lib/firebase";
import useAuth from "./context/useAuth";
import useCommunityBoard from "./hooks/useCommunityBoard";
import { ALLOWED_CATEGORIES } from "./constants/categories";

function PublicLineRoute({ getLineById }) {
  const { id } = useParams();
  const [line, setLine] = useState(undefined);

  useEffect(() => {
    let isCancelled = false;

    getLineById(id).then((nextLine) => {
      if (!isCancelled) {
        setLine(nextLine);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [getLineById, id]);

  return <LineDetailPage line={line ?? null} />;
}

function PublicProfileRoute({ getPublicProfileLines }) {
  const { id } = useParams();
  const [lines, setLines] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    getPublicProfileLines(id).then((nextLines) => {
      if (!isCancelled) {
        setLines(nextLines);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [getPublicProfileLines, id]);

  return <PublicProfilePage lines={lines} profileId={id} />;
}

function App() {
  const [filter, setFilter] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();
  const activeBoardView =
    location.pathname === "/lines"
      ? "candidates"
      : location.pathname === "/promoted"
        ? "promoted"
        : location.pathname === "/profile"
          ? "profile"
          : location.pathname === "/admin"
            ? "admin"
            : null;
  const {
    authEnabled,
    isCompletingEmailSignUp,
    isAdmin,
    isAuthReady,
    isRoleReady,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    signUpWithEmail,
    user,
  } = useAuth();
  const {
    boardError,
    candidateLines,
    getLineById,
    getPublicProfileLines,
    hasMoreCandidates,
    hasMorePromoted,
    isBoardLoading,
    isFetchingMore,
    loadMoreLines,
    lookupExistingLine,
    moderateLine,
    pendingLines,
    promotedLines,
    submitLine,
    userLines,
    votes,
    voteOnLine,
  } = useCommunityBoard(user, activeBoardView, isAdmin);

  useEffect(() => {
    if (!user || isCompletingEmailSignUp) {
      return;
    }

    if (location.pathname === "/" || location.pathname === "/login") {
      navigate("/promoted", { replace: true });
    }
  }, [isCompletingEmailSignUp, location.pathname, navigate, user]);

  const combinedCategories = useMemo(
    () =>
      [
        ...new Set([
          ...ALLOWED_CATEGORIES,
          ...candidateLines.map((line) => line.category),
          ...promotedLines.map((line) => line.category),
        ]),
      ]
        .filter(Boolean)
        .sort(),
    [candidateLines, promotedLines],
  );

  const filteredCandidates = candidateLines.filter(
    (line) => filter === "all" || line.category === filter,
  );
  const filteredPromoted = promotedLines.filter(
    (line) => filter === "all" || line.category === filter,
  );
  const topLine = filteredCandidates[0] ?? candidateLines[0] ?? null;
  const stats = {
    total: candidateLines.length + promotedLines.length,
    topScore: topLine?.score ?? 0,
    promotedCount: promotedLines.length,
    candidateCount: candidateLines.length,
  };

  async function handleSignIn() {
    await signInWithGoogle();
    navigate("/promoted");
  }

  async function handleEmailSignIn(email, password) {
    await signInWithEmail(email, password);
    navigate("/promoted");
  }

  async function handleEmailSignUp(email, password, displayName) {
    await signUpWithEmail(email, password, displayName);
  }

  const isLandingRoute = location.pathname === "/";
  const isLoginRoute = location.pathname === "/login";
  const shouldShowFooter = !isLoginRoute;

  return (
    <div className="page-shell">
      <div className="paper-grain" aria-hidden="true"></div>
      {isLandingRoute ? (
        <Hero
          authEnabled={authEnabled}
          isAuthReady={isAuthReady}
          stats={stats}
          user={user}
        />
      ) : isLoginRoute ? null : (
        <AppHeader
          authEnabled={authEnabled}
          isAdmin={isAdmin}
          onSignOut={signOutUser}
          user={user}
        />
      )}
      <main>
        {!firebaseConfigReady ? (
          <section className="status-banner">
            Add your Firebase web config to <code>.env</code> to enable Google
            sign-in and Firestore syncing.
          </section>
        ) : null}
        {boardError && activeBoardView ? (
          <section className="status-banner status-banner--error">
            {boardError}
          </section>
        ) : null}

        <Routes>
          <Route path="/" element={<LandingPage authEnabled={authEnabled} />} />
          <Route
            path="/login"
            element={
              user ? (
                isCompletingEmailSignUp ? null : (
                  <Navigate to="/promoted" replace />
                )
              ) : (
                <LoginPage
                  authEnabled={authEnabled}
                  isAuthReady={isAuthReady}
                  onEmailSignIn={handleEmailSignIn}
                  onGoogleSignIn={handleSignIn}
                  onEmailSignUp={handleEmailSignUp}
                />
              )
            }
          />
          <Route
            path="/lines"
            element={
              user ? (
                <section className="main-shell">
                  <BoardPage
                    activeRoute="lines"
                    categories={combinedCategories}
                    filter={filter}
                    hasMore={hasMoreCandidates}
                    isBoardLoading={isBoardLoading}
                    isFetchingMore={isFetchingMore}
                    lines={filteredCandidates}
                    onLoadMore={() => loadMoreLines("candidates")}
                    onFilterChange={setFilter}
                    onVote={voteOnLine}
                    user={user}
                    votes={votes}
                  />
                </section>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/promoted"
            element={
              user ? (
                <section className="main-shell">
                  <BoardPage
                    activeRoute="promoted"
                    categories={combinedCategories}
                    filter={filter}
                    hasMore={hasMorePromoted}
                    isBoardLoading={isBoardLoading}
                    isFetchingMore={isFetchingMore}
                    lines={filteredPromoted}
                    onLoadMore={() => loadMoreLines("promoted")}
                    onFilterChange={setFilter}
                    onVote={voteOnLine}
                    user={user}
                    votes={votes}
                  />
                </section>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/create"
            element={
              user ? (
                <section className="main-shell">
                  <CreatePage
                    authEnabled={authEnabled}
                    lookupExistingLine={lookupExistingLine}
                    onSubmit={submitLine}
                    user={user}
                  />
                </section>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              user ? (
                <section className="main-shell">
                  <ProfilePage lines={userLines} user={user} />
                </section>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PublicProfileRoute
                getPublicProfileLines={getPublicProfileLines}
              />
            }
          />
          <Route
            path="/line/:id"
            element={<PublicLineRoute getLineById={getLineById} />}
          />
          <Route
            path="/admin"
            element={
              user ? (
                !isRoleReady ? (
                  <section className="main-shell">
                    <article className="section-card">
                      <p className="empty-state">Checking admin access...</p>
                    </article>
                  </section>
                ) : isAdmin ? (
                  <section className="main-shell">
                    <AdminPage
                      isLoading={isBoardLoading}
                      lines={pendingLines}
                      onModerate={moderateLine}
                    />
                  </section>
                ) : (
                  <Navigate to="/promoted" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
      {shouldShowFooter ? <Footer /> : null}
    </div>
  );
}

export default App;
