import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer" data-od-id="site-footer">
      <div className="site-footer__poster">
        <div className="site-footer__inner">
          <p className="site-footer__aside">
            One good question can reopen a room.
          </p>
          <h2 className="site-footer__statement">
            <span>Keep</span>
            <span>talking.</span>
          </h2>
        </div>
      </div>

      <div className="site-footer__base">
        <div className="site-footer__inner">
          <p className="site-footer__credit">
            Built by Bhavik Pawar &amp; Abhijeet Kakade
          </p>
          <nav className="site-footer__links" aria-label="Footer">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/privacy#analytics-settings">Analytics settings</Link>
            <Link to="/security">Security</Link>
            <a
              href="https://github.com/BhavikPawar29/IceBreaker"
              target="_blank"
              rel="noreferrer"
            >
              Contribute on GitHub
            </a>
          </nav>
          <p className="site-footer__note">
            Designed using{" "}
            <a href="https://open-design.ai/" target="_blank" rel="noreferrer">
              OpenDesign
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
