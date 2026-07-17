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
            <p className="eyebrow">For shy people, not smooth talkers</p>
            <h1>Join anonymously.</h1>
            <p className="login-lead">
              Your account keeps your ideas attached to you privately. The board
              shows them anonymously.
            </p>

            <div className="login-points">
              <article>
                <strong>Anonymous by default</strong>
                <span>Your public ideas do not show your real name.</span>
              </article>
              <article>
                <strong>Quick entry</strong>
                <span>Use Google, or create a small email account here.</span>
              </article>
              <article>
                <strong>Review first</strong>
                <span>
                  New ideas still wait for approval before going live.
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
