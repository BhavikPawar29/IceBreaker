import { NavLink } from "react-router-dom";

function AppHeader({ authEnabled, isAdmin, onSignOut, user }) {
  return (
    <header className="app-header">
      <nav className="topbar" aria-label="Primary">
        <NavLink className="brand" to={user ? "/promoted" : "/"}>
          <span className="brand-mark">IceBreaker</span>
          <span className="brand-sub">human-backed conversation ideas</span>
        </NavLink>
        <div className="topbar-actions">
          <div className="route-tabs route-tabs--header">
            {user ? (
              <>
                <NavLink
                  to="/promoted"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Top picks
                </NavLink>
                <NavLink
                  to="/lines"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Explore
                </NavLink>
                <NavLink
                  to="/create"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Share one
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Profile
                </NavLink>
                {isAdmin ? (
                  <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                      `route-tab ${isActive ? "is-active" : ""}`
                    }
                  >
                    Admin
                  </NavLink>
                ) : null}
              </>
            ) : (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `route-tab ${isActive ? "is-active" : ""}`
                  }
                >
                  Login
                </NavLink>
              </>
            )}
          </div>
          {authEnabled ? (
            user ? (
              <div className="auth-chip-group auth-chip-group--app">
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
            <span className="auth-chip">Firebase config not connected yet</span>
          )}
        </div>
      </nav>
    </header>
  );
}

export default AppHeader;
