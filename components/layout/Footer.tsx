import Link from 'next/link';

const quickLinks = [
  { href: '/certification', label: 'Certification' },
  { href: '/coaches', label: 'Find a Coach' },
  { href: '/resources', label: 'Resource Library' },
  { href: '/about', label: 'About Us' },
];

const contactLinks = [
  { href: '/events', label: 'Global Chapters' },
  { href: '/contact', label: 'Partner Program' },
  { href: '/resources', label: 'Press Kit' },
  { href: '/contact', label: 'Help Center' },
];

const socialLinks = [
  {
    href: '#',
    label: 'Website',
    short: '◌',
  },
  {
    href: '#',
    label: 'Email',
    short: '✉',
  },
  {
    href: '#',
    label: 'Share',
    short: '↗',
  },
];

type FooterProps = {
  siteName?: string;
  footerSummary?: string;
  executiveDirectorEmail?: string;
};

export function Footer({
  siteName = 'WIAL Global',
  footerSummary = "The world's leading authority in Action Learning training and certification.",
  executiveDirectorEmail = 'info@wial.org',
}: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__panel">
        <div className="container">
          <div className="site-footer__grid">
            <div className="site-footer__brand">
              <Link className="site-wordmark site-wordmark--footer" href="/">
                {siteName}
              </Link>
              <p className="site-footer__summary">{footerSummary}</p>
              <a className="site-footer__email" href={`mailto:${executiveDirectorEmail}`}>
                Executive Director: {executiveDirectorEmail}
              </a>

              <div className="site-footer__socials" aria-label="Social links">
                {socialLinks.map((link) => (
                  <a aria-label={link.label} href={link.href} key={link.label}>
                    {link.short}
                  </a>
                ))}
              </div>
            </div>

            <div className="site-footer__column">
              <h3>Quick Links</h3>
              <div className="site-footer__list">
                {quickLinks.map((link) => (
                  <Link href={link.href} key={link.label}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="site-footer__column">
              <h3>Contact Us</h3>
              <div className="site-footer__list">
                {contactLinks.map((link) => (
                  <Link href={link.href} key={link.label}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="site-footer__column">
              <h3>Stay Updated</h3>
              <p className="site-footer__subscribe-copy">
                Join our newsletter for latest AL research and updates.
              </p>
              <form action="#" className="site-footer__subscribe">
                <input aria-label="Email address" placeholder="Email address" type="email" />
                <button type="submit">Join</button>
              </form>
            </div>
          </div>

          <div className="site-footer__meta">
            <p>© 2024 {siteName}. All rights reserved.</p>
            <div>
              <Link href="/contact">Privacy Policy</Link>
              <Link href="/contact">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
