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

function LoadingShell({
  title = "Loading IceBreaker",
  note = "Bringing your board back into place.",
}) {
  return (
    <section className="main-shell main-shell--loading">
      <article className="section-card app-loader-card" aria-live="polite">
        <div className="app-loader-mark" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="eyebrow">Just a second</p>
        <h2>{title}</h2>
        <p className="page-description">{note}</p>
      </article>
    </section>
  );
}

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
    isAdmin,
    isAuthReady,
    isRoleReady,
    signInWithApple,
    signInWithFacebook,
    signInWithGoogle,
    signOutUser,
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
    if (!user) {
      return;
    }

    if (location.pathname === "/" || location.pathname === "/login") {
      navigate("/promoted", { replace: true });
    }
  }, [location.pathname, navigate, user]);

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
  const isSessionLoading = !isAuthReady || (Boolean(user) && !isRoleReady);
  const stats = {
    total: candidateLines.length + promotedLines.length,
    topScore: topLine?.score ?? 0,
    promotedCount: promotedLines.length,
    candidateCount: candidateLines.length,
  };

  async function handleGoogleSignIn() {
    await signInWithGoogle();
  }

  async function handleFacebookSignIn() {
    await signInWithFacebook();
  }

  async function handleAppleSignIn() {
    await signInWithApple();
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
            Add your Firebase web config to <code>.env</code> to enable social
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
              isSessionLoading ? (
                <LoadingShell
                  title="Opening your account"
                  note="Checking your sign-in so you land in the right place."
                />
              ) : user ? (
                <Navigate to="/promoted" replace />
              ) : (
                <LoginPage
                  authEnabled={authEnabled}
                  isAuthReady={isAuthReady}
                  onAppleSignIn={handleAppleSignIn}
                  onFacebookSignIn={handleFacebookSignIn}
                  onGoogleSignIn={handleGoogleSignIn}
                />
              )
            }
          />
          <Route
            path="/lines"
            element={
              isSessionLoading ? (
                <LoadingShell note="Pulling the latest ideas onto the board." />
              ) : user ? (
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
              isSessionLoading ? (
                <LoadingShell note="Gathering the ideas people loved most." />
              ) : user ? (
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
              isSessionLoading ? (
                <LoadingShell
                  title="Opening your submission space"
                  note="Holding your session steady before we open the form."
                />
              ) : user ? (
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
              isSessionLoading ? (
                <LoadingShell
                  title="Opening your profile"
                  note="Laying out your ideas, reviews, and saved progress."
                />
              ) : user ? (
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
              isSessionLoading ? (
                <LoadingShell
                  title="Checking review access"
                  note="Making sure the right moderation controls open for you."
                />
              ) : user ? (
                isAdmin ? (
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
