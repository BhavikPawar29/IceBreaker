import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function navigateToAnchor(navigate, pathname, hash) {
  if (pathname !== "/") {
    navigate(`/${hash}`);
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const offset = window.innerWidth < 768 ? 72 : 88;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export default function LandingNavigation({
  solid,
  isAuthed,
  onPrimaryAction,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToAnchor = (hash) => {
    setMenuOpen(false);
    navigateToAnchor(navigate, location.pathname, hash);
  };

  return (
    <header
      className={`topbar ${solid ? "is-solid" : ""}`}
      data-od-id="landing-navigation"
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="topbar__inner">
        <Link className="topbar__brand" to="/">
          Breaking Ice
        </Link>

        <nav className="topbar__links" aria-label="Primary">
          <button
            type="button"
            className="topbar__link"
            onClick={() => goToAnchor("#how-it-works")}
          >
            How it works
          </button>
          <button
            type="button"
            className="topbar__link"
            onClick={() => goToAnchor("#situations")}
          >
            Situations
          </button>
          <button
            type="button"
            className="topbar__link"
            onClick={() => navigate("/lines")}
          >
            Community
          </button>
        </nav>

        <div className="topbar__actions">
          <button
            type="button"
            className="button button--ghost topbar__menu"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open the mobile menu"
          >
            Menu
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onPrimaryAction(isAuthed)}
          >
            Try Live Mode
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          className="topbar__mobile-panel"
          id="mobile-menu"
          aria-label="Mobile"
        >
          <button
            type="button"
            className="topbar__mobile-link"
            onClick={() => goToAnchor("#how-it-works")}
          >
            How it works
          </button>
          <button
            type="button"
            className="topbar__mobile-link"
            onClick={() => goToAnchor("#situations")}
          >
            Situations
          </button>
          <button
            type="button"
            className="topbar__mobile-link"
            onClick={() => {
              setMenuOpen(false);
              navigate("/lines");
            }}
          >
            Community
          </button>
          <button
            type="button"
            className="button button--primary topbar__mobile-cta"
            onClick={() => {
              setMenuOpen(false);
              onPrimaryAction(isAuthed);
            }}
          >
            Try Live Mode
          </button>
        </nav>
      )}
    </header>
  );
}
