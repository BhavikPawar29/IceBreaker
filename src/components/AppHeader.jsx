import { useState } from "react";
import { NavLink } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3.6 2.35 4.77 5.27.77-3.81 3.72.9 5.25L12 15.64l-4.71 2.48.9-5.25-3.81-3.72 5.27-.77Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path d="M9.7 14.3 11 11l3.3-1.3-1.3 3.3L9.7 14.3Z" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="8.2"
        r="3.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5.5 19.2a6.5 6.5 0 0 1 13 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 5.8 6v5.4c0 4.2 2.6 7.8 6.2 9.1 3.6-1.3 6.2-4.9 6.2-9.1V6L12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m9.3 11.9 1.8 1.8 3.6-3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4.6 10.8 7.4-6 7.4 6v8.4h-4.9v-5.4H9.5v5.4H4.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 3 5.8 13h5.4L10 21l8.2-11h-5.6Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 12h14m-5-5 5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 6H6.8A1.8 1.8 0 0 0 5 7.8v8.4A1.8 1.8 0 0 0 6.8 18H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M13 8l4 4-4 4M17 12H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppHeader({ authEnabled, isAdmin, isBanned, onSignOut, user }) {
  const isMobile = useIsMobile();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const accountLabel = user?.displayName || user?.email || "community member";
  const accountInitial = accountLabel.slice(0, 1).toUpperCase();

  const appLinks = [
    { icon: <BoltIcon />, label: "Live", to: "/live" },
    { icon: <StarIcon />, label: "Top picks", to: "/promoted" },
    { icon: <CompassIcon />, label: "Explore", to: "/lines" },
    ...(isBanned
      ? []
      : [{ icon: <PlusIcon />, label: "Share", to: "/create" }]),
    { icon: <UserIcon />, label: "Profile", to: "/profile" },
    ...(isAdmin
      ? [{ icon: <ShieldIcon />, label: "Admin", to: "/admin" }]
      : []),
  ];
  const publicLinks = [
    { icon: <HomeIcon />, label: "Home", to: "/" },
    { icon: <ArrowIcon />, label: "Login", to: "/login" },
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

  async function confirmLogout() {
    setIsLogoutOpen(false);
    await onSignOut();
  }

  return (
    <>
      <header className={`app-header ${isMobile ? "app-header--mobile" : ""}`}>
        <nav
          className={`topbar ${isMobile ? "topbar--mobile" : ""}`}
          aria-label="Primary"
        >
          <NavLink className="brand" to={user ? "/live" : "/"}>
            <span className="brand-mark">Breaking Ice</span>
            {!isMobile ? (
              <span className="brand-sub">instant conversation cheat code</span>
            ) : null}
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
                  {isMobile ? (
                    <span className="mobile-account-avatar" aria-hidden="true">
                      {accountInitial}
                    </span>
                  ) : null}
                  <span className="auth-chip auth-chip--user">
                    {accountLabel}
                  </span>
                  {isBanned ? (
                    <span className="auth-chip auth-chip--warning">
                      Posting disabled
                    </span>
                  ) : null}
                  <button
                    className="ghost-link auth-button"
                    type="button"
                    onClick={() => setIsLogoutOpen(true)}
                    aria-label="Logout"
                    title="Logout"
                  >
                    {isMobile ? <LogoutIcon /> : "Logout"}
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
      {isLogoutOpen ? (
        <div
          className="confirm-overlay"
          role="presentation"
          onMouseDown={() => setIsLogoutOpen(false)}
        >
          <section
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Logout</p>
            <h2 id="logout-confirm-title">Do you really want to log out?</h2>
            <p>
              You can sign back in any time, but this will close your current
              session.
            </p>
            <div className="confirm-actions">
              <button
                className="action-button"
                type="button"
                onClick={() => setIsLogoutOpen(false)}
              >
                Stay
              </button>
              <button
                className="action-button action-button--danger"
                type="button"
                onClick={confirmLogout}
              >
                Log out
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default AppHeader;
