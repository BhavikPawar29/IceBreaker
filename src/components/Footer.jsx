function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-credits">
          <p className="eyebrow">Built with love by</p>
          <div className="footer-authors">
            <a
              href="https://bhavik-pawar.vercel.app/"
              target="_blank"
              rel="noreferrer"
            >
              <h3>Bhavik Pawar</h3>
            </a>
            <span className="author-amp">&</span>
            <a
              href="https://abhijeetkakade.in/"
              target="_blank"
              rel="noreferrer"
            >
              <h3>Abhijeet Kakade</h3>
            </a>
          </div>
          <p className="footer-copy">
            IceBreaker helps shy people find better, human-backed things to ask
            when they already know someone a little but do not know how to keep
            the conversation moving.
          </p>
        </div>
        <div className="footer-links">
          <a
            href="https://github.com/BhavikPawar29/IceBreaker"
            target="_blank"
            rel="noreferrer"
          >
            Contribute on GitHub
          </a>
          <a
            href="https://designwith.abhijeetkakade.in/"
            target="_blank"
            rel="noreferrer"
          >
            Designed using design.md
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
