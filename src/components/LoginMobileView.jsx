import { Link } from "react-router-dom";
import { BackIcon } from "./authIcons";

function LoginMobileView({ authCard }) {
  return (
    <section className="main-shell login-page-shell">
      <div className="login-layout login-layout--mobile">
        <Link className="ghost-link icon-link login-mobile-back" to="/">
          <BackIcon />
          <span>Back to home</span>
        </Link>
        {authCard}
      </div>
    </section>
  );
}

export default LoginMobileView;
