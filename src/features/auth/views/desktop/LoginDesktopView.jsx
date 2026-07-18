import { Link } from "react-router-dom";
import { BackIcon } from "../../components/authIcons";

function LoginDesktopView({ authCard }) {
  return (
    <section className="main-shell login-page-shell">
      <div className="login-layout">
        <aside className="login-side section-card">
          <figure className="login-editorial">
            <img
              src="/editorial/lamp-rain-study.webp"
              alt="Two people quietly sharing coffee beside a rainy window"
            />
          </figure>

          <div className="login-side-copy">
            <p className="eyebrow">A quieter place</p>
            <h1>Come in. It&apos;s quieter here.</h1>
            <p className="login-lead">
              Save the lines that helped, share the ones that might help someone
              else, and stay anonymous on the public board.
            </p>

            <div className="login-points">
              <article>
                <strong>Private by default</strong>
                <span>Your public ideas do not show your real name.</span>
              </article>
              <article>
                <strong>Fast entry</strong>
                <span>Use Google, or create a simple email account here.</span>
              </article>
              <article>
                <strong>Gentle review</strong>
                <span>
                  New ideas wait for approval before they reach the board.
                </span>
              </article>
            </div>

            <div className="login-side-links">
              <Link className="ghost-link icon-link" to="/">
                <BackIcon />
                <span>Back to home</span>
              </Link>
            </div>
          </div>
        </aside>

        {authCard}
      </div>
    </section>
  );
}

export default LoginDesktopView;
