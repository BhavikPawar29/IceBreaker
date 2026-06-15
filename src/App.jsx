import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
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
import Seo from "./components/Seo";
import SketchBackdrop from "./components/SketchBackdrop";
import RouteShimmer from "./components/RouteShimmer";
import StatePanel from "./components/StatePanel";
import ScrollToTop from "./components/ScrollToTop";
import { firebaseConfigReady } from "./lib/firebase";
import useAuth from "./context/useAuth";
import useCommunityBoard from "./hooks/useCommunityBoard";
import useAdminDashboard from "./hooks/useAdminDashboard";
import { ALLOWED_CATEGORIES } from "./constants/categories";
import { safeTrackEvent } from "./utils/analytics";
import {
  consumePendingShareAuth,
  getShareAttribution,
} from "./utils/shareFlow";

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

function normalizeAnalyticsPath(path) {
  const normalizedInput = String(path || "")
    .split("#")[0]
    .split("?")[0]
    .replace(/\/+$/, "");

  if (!normalizedInput || normalizedInput === "/") {
    return "/";
  }

  if (/^\/line\/[^/]+$/.test(normalizedInput)) {
    return "/line/:id";
  }

  if (/^\/profile\/[^/]+$/.test(normalizedInput)) {
    return "/profile/:id";
  }

  return normalizedInput;
}

function getRouteTitle(pathname) {
  const normalizedPath = normalizeAnalyticsPath(pathname);

  switch (normalizedPath) {
    case "/":
      return "landing";
    case "/login":
      return "login";
    case "/live":
      return "live";
    case "/lines":
      return "explore";
    case "/promoted":
      return "top_picks";
    case "/create":
      return "share";
    case "/profile":
      return "profile";
    case "/profile/:id":
      return "public_profile";
    case "/line/:id":
      return "line_detail";
    case "/admin":
      return "admin";
    case "/privacy":
      return "privacy";
    case "/security":
      return "security";
    default:
      return "unknown";
  }
}

function getRouteSeo(pathname) {
  const normalizedPath = normalizeAnalyticsPath(pathname);

  switch (normalizedPath) {
    case "/":
      return {
        canonicalPath: "/",
        description:
          "Instant conversation lines for awkward moments, dates, new friends, and group chats.",
        robots: "index,follow",
        title: "Breaking Ice",
        type: "website",
      };
    case "/privacy":
      return {
        canonicalPath: "/privacy",
        description:
          "Read how Breaking Ice handles account data, anonymous public sharing, moderation records, and limited browser storage.",
        robots: "index,follow",
        title: "Privacy Policy | Breaking Ice",
        type: "article",
      };
    case "/security":
      return {
        canonicalPath: "/security",
        description:
          "Read the current security posture for Breaking Ice, including moderation, abuse controls, sign-in, and reporting.",
        robots: "index,follow",
        title: "Security | Breaking Ice",
        type: "article",
      };
    case "/profile/:id":
      return {
        canonicalPath: pathname,
        description: "Anonymous contributor ideas shared on Breaking Ice.",
        robots: "index,follow",
        title: "Anonymous Contributor Ideas | Breaking Ice",
        type: "profile",
      };
    case "/line/:id":
      return {
        canonicalPath: pathname,
        description:
          "A public conversation idea from the Breaking Ice community.",
        robots: "index,follow",
        title: "Conversation Idea | Breaking Ice",
        type: "article",
      };
    case "/login":
      return {
        canonicalPath: "/login",
        description:
          "Create an account or sign in to use Breaking Ice live mode and share conversation ideas.",
        robots: "noindex,nofollow",
        title: "Login | Breaking Ice",
        type: "website",
      };
    default:
      return {
        canonicalPath: pathname,
        description:
          "Breaking Ice helps you get one natural thing to say without endless scrolling.",
        robots: "noindex,nofollow",
        title: "Breaking Ice",
        type: "website",
      };
  }
}

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

function PublicLineRoute({ getLineById, user }) {
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

  return <LineDetailPage line={line} user={user} />;
}

function PublicProfileRoute({ getPublicProfileLines, user }) {
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

  return <PublicProfilePage lines={lines} profileId={id} user={user} />;
}

function App() {
  const [filter, setFilter] = useState("all");
  const routeLocation = useLocation();
  const navigate = useNavigate();
  const lastTrackedRouteRef = useRef("");
  const activeBoardView =
    routeLocation.pathname === "/lines"
      ? "candidates"
      : routeLocation.pathname === "/promoted"
        ? "promoted"
        : routeLocation.pathname === "/profile"
          ? "profile"
          : null;
  const isAdminRoute = routeLocation.pathname === "/admin";
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

    if (routeLocation.pathname === "/login") {
      const pendingShareAuth = consumePendingShareAuth();

      if (pendingShareAuth) {
        safeTrackEvent("auth_completed_from_share", pendingShareAuth);
      }
    }

    if (routeLocation.pathname === "/login") {
      navigate("/live", { replace: true });
    }
  }, [navigate, routeLocation.pathname, user]);

  useEffect(() => {
    const normalizedPath = normalizeAnalyticsPath(routeLocation.pathname);
    const trackingKey = `${normalizedPath}:${routeLocation.key || ""}`;

    if (lastTrackedRouteRef.current === trackingKey) {
      return;
    }

    lastTrackedRouteRef.current = trackingKey;
    safeTrackEvent("route_view", {
      route_path: normalizedPath,
      route_title: getRouteTitle(routeLocation.pathname),
      route_type: "page",
    });
  }, [routeLocation.key, routeLocation.pathname]);

  useEffect(() => {
    const shareAttribution = getShareAttribution(routeLocation.search);

    if (!shareAttribution) {
      return;
    }

    safeTrackEvent("share_landing_viewed", {
      route_path: normalizeAnalyticsPath(routeLocation.pathname),
      share_id: shareAttribution.shareId,
      share_surface: shareAttribution.shareSurface,
      share_target: shareAttribution.shareTarget,
      share_type: shareAttribution.shareType,
      visitor_state: user ? "signed_in" : "signed_out",
    });
  }, [routeLocation.pathname, routeLocation.search, user]);

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

  const isLandingRoute = routeLocation.pathname === "/";
  const isLoginRoute = routeLocation.pathname === "/login";
  const isLiveRoute = routeLocation.pathname === "/live";
  const routeSeo = getRouteSeo(routeLocation.pathname);
  const shouldShowFooter =
    isLandingRoute ||
    routeLocation.pathname === "/privacy" ||
    routeLocation.pathname === "/security";
  const isInAppSurface = Boolean(user) && !isLandingRoute && !isLoginRoute;
  return (
    <div className={`page-shell ${isInAppSurface ? "page-shell--app" : ""}`}>
      <Seo {...routeSeo} />
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
                  user={user}
                />
              }
            />
            <Route
              path="/line/:id"
              element={
                <PublicLineRoute getLineById={getLineById} user={user} />
              }
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
