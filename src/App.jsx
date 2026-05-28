import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import AppHeader from "./components/AppHeader";
import InstallAppPrompt from "./components/InstallAppPrompt";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import SketchBackdrop from "./components/SketchBackdrop";
import RouteShimmer from "./components/RouteShimmer";
import StatePanel from "./components/StatePanel";
import ScrollToTop from "./components/ScrollToTop";
import { firebaseConfigReady } from "./lib/firebase";
import useAuth from "./context/useAuth";
import useCommunityBoard from "./hooks/useCommunityBoard";
import useAdminDashboard from "./hooks/useAdminDashboard";
import { ALLOWED_CATEGORIES } from "./constants/categories";

const BoardPage = lazy(() => import("./components/BoardPage"));
const CreatePage = lazy(() => import("./components/CreatePage"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const LineDetailPage = lazy(() => import("./components/LineDetailPage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const LivePage = lazy(() => import("./components/LivePage"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const PublicProfilePage = lazy(() => import("./components/PublicProfilePage"));
const AdminPage = lazy(() => import("./components/AdminPage"));
const PrivacyPage = lazy(() => import("./components/PrivacyPage"));
const SecurityPage = lazy(() => import("./components/SecurityPage"));
const showCapacityNote = import.meta.env.VITE_SHOW_CAPACITY_NOTE === "true";

function LoadingShell({
  title = "Loading IceBreaker",
  note = "Bringing your board back into place.",
}) {
  return (
    <section className="main-shell main-shell--loading">
      <StatePanel
        className="section-card app-loader-card"
        loading
        message={note}
        title={title}
        variant="loading"
      >
        <RouteShimmer className="route-shimmer--hero" />
      </StatePanel>
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

  return <LineDetailPage line={line} />;
}

function PublicProfileRoute({ getPublicProfileLines }) {
  const { id } = useParams();
  const [lines, setLines] = useState(undefined);

  useEffect(() => {
    let isCancelled = false;

    getPublicProfileLines(id).then((nextLines) => {
      if (!isCancelled) {
        setLines(nextLines || []);
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
          : null;
  const isAdminRoute = location.pathname === "/admin";
  const {
    authEnabled,
    banInfo,
    isAdmin,
    isAuthReady,
    isBanReady,
    isRoleReady,
    sendEmailPasswordReset,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
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
    promotedLines,
    submitLine,
    userLines,
    votes,
    voteOnLine,
  } = useCommunityBoard(user, activeBoardView, isAdmin);
  const adminDashboard = useAdminDashboard(user, isAdmin, isAdminRoute);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (location.pathname === "/login") {
      navigate("/live", { replace: true });
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
  const isSessionLoading = !isAuthReady || (Boolean(user) && !isRoleReady);
  const isBanned = Boolean(user && banInfo);
  const banReason = banInfo?.reason?.trim();

  async function handleGoogleSignIn() {
    await signInWithGoogle();
  }

  async function handleEmailLogin(email, password) {
    await signInWithEmail(email, password);
  }

  async function handleEmailSignUp(email, password, displayName) {
    await signUpWithEmail(email, password, displayName);
  }

  async function handlePasswordReset(email) {
    await sendEmailPasswordReset(email);
  }

  const isLandingRoute = location.pathname === "/";
  const isLoginRoute = location.pathname === "/login";
  const isLiveRoute = location.pathname === "/live";
  const shouldShowFooter = !user && !isLoginRoute && !isLiveRoute;
  const isInAppSurface = Boolean(user) && !isLandingRoute && !isLoginRoute;
  return (
    <div className={`page-shell ${isInAppSurface ? "page-shell--app" : ""}`}>
      <ScrollToTop />
      <div className="paper-grain" aria-hidden="true"></div>
      <SketchBackdrop />
      {isLandingRoute ? (
        <Hero authEnabled={authEnabled} isAuthReady={isAuthReady} user={user} />
      ) : isLoginRoute || (isLiveRoute && !user) ? null : (
        <AppHeader
          authEnabled={authEnabled}
          isAdmin={isAdmin}
          isBanned={isBanned}
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
        {showCapacityNote && isInAppSurface ? (
          <section className="status-banner status-banner--capacity">
            <strong>Thank you</strong>
            <span>
              More people are joining Breaking Ice than expected. If something
              feels a little slow, we are making room for everyone.
            </span>
          </section>
        ) : null}
        {user && isBanReady && isBanned ? (
          <section className="status-banner status-banner--error">
            Your account cannot post new lines right now.
            {banReason ? ` Reason: ${banReason}.` : ""}
          </section>
        ) : null}

        <Suspense fallback={<LoadingShell />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route
              path="/login"
              element={
                isSessionLoading ? (
                  <LoadingShell
                    title="Opening your account"
                    note="Checking your sign-in so you land in the right place."
                  />
                ) : user ? (
                  <Navigate to="/live" replace />
                ) : (
                  <LoginPage
                    authEnabled={authEnabled}
                    isAuthReady={isAuthReady}
                    onEmailLogin={handleEmailLogin}
                    onEmailSignUp={handleEmailSignUp}
                    onPasswordReset={handlePasswordReset}
                    onGoogleSignIn={handleGoogleSignIn}
                  />
                )
              }
            />
            <Route
              path="/live"
              element={
                isSessionLoading ? (
                  <LoadingShell
                    title="Opening live mode"
                    note="Checking your sign-in before showing conversation prompts."
                  />
                ) : user ? (
                  <LivePage user={user} />
                ) : (
                  <Navigate to="/login" replace />
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
                      isBanned={isBanned}
                      banReason={banReason}
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
                      <AdminPage dashboard={adminDashboard} />
                    </section>
                  ) : (
                    <Navigate to="/live" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </main>
      <InstallAppPrompt user={user} />
      {shouldShowFooter ? <Footer /> : null}
    </div>
  );
}

export default App;
