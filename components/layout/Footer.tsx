import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__inner">
          <div>
            <div className="brand-lockup">
              <span aria-hidden="true" className="brand-lockup__mark">
                <span className="brand-lockup__bar brand-lockup__bar--olive-sm" />
                <span className="brand-lockup__bar brand-lockup__bar--olive" />
                <span className="brand-lockup__bar brand-lockup__bar--brand" />
                <span className="brand-lockup__bar brand-lockup__bar--brand-lg" />
                <span className="brand-lockup__bar brand-lockup__bar--brand-slice" />
              </span>
              <span className="brand-lockup__text">
                <strong>World Institute for Action Learning</strong>
                <span>wial.org</span>
              </span>
            </div>
            <p className="site-footer__meta">
              Washington, DC
              <br />
              Advancing Action Learning through a global chapter network.
            </p>
          </div>

          <div className="site-footer__links" aria-label="Footer">
            <Link href="/about">About</Link>
            <Link href="/certification">Certification</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
