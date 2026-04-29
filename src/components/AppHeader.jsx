import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

function AppHeader({ authEnabled, isAdmin, onSignOut, user }) {
  const isMobile = useIsMobile();

  const appLinks = [
    { icon: "★", label: "Top picks", to: "/promoted" },
    { icon: "⌕", label: "Explore", to: "/lines" },
    { icon: "+", label: "Share", to: "/create" },
    { icon: "⌂", label: "Profile", to: "/profile" },
    ...(isAdmin ? [{ icon: "✓", label: "Admin", to: "/admin" }] : []),
  ];
  const publicLinks = [
    { icon: "⌂", label: "Home", to: "/" },
    { icon: "→", label: "Login", to: "/login" },
  ];
  const routeLinks = (user ? appLinks : publicLinks).map((link) => (
    <NavLink
      key={link.to}
      to={link.to}
      className={({ isActive }) => `route-tab ${isActive ? "is-active" : ""}`}
    >
      <span className="route-tab-icon" aria-hidden="true">
        {link.icon}
      </span>
      <span className="route-tab-label">{link.label}</span>
    </NavLink>
  ));

  return (
    <>
      <header className={`app-header ${isMobile ? "app-header--mobile" : ""}`}>
        <nav
          className={`topbar ${isMobile ? "topbar--mobile" : ""}`}
          aria-label="Primary"
        >
          <NavLink className="brand" to={user ? "/promoted" : "/"}>
            <span className="brand-mark">IceBreaker</span>
            <span className="brand-sub">human-backed conversation ideas</span>
          </NavLink>
          <div
            className={`topbar-actions ${
              isMobile ? "topbar-actions--mobile" : ""
            }`}
          >
            {!isMobile ? (
              <div className="route-tabs route-tabs--header">{routeLinks}</div>
            ) : null}
            {authEnabled ? (
              user ? (
                <div
                  className={`auth-chip-group auth-chip-group--app ${
                    isMobile ? "auth-chip-group--mobile" : ""
                  }`}
                >
                  <span className="auth-chip auth-chip--user">
                    {user.displayName || user.email || "community member"}
                  </span>
                  <button
                    className="ghost-link auth-button"
                    type="button"
                    onClick={onSignOut}
                  >
                    Logout
                  </button>
                </div>
              ) : null
            ) : (
              <span className="auth-chip">
                Firebase config not connected yet
              </span>
            )}
          </div>
        </nav>
      </header>
      {isMobile ? (
        <nav className="mobile-bottom-nav" aria-label="Mobile primary">
          <div className="route-tabs route-tabs--mobile-bottom">
            {routeLinks}
          </div>
        </nav>
      ) : null}
    </>
  );
}

export default AppHeader;
