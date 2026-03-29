import Link from 'next/link';
import { HeaderAuthButton } from '@/components/layout/HeaderAuthButton';
import { MobileNav } from '@/components/layout/MobileNav';

const defaultNavItems = [
  { href: '/certification', label: 'Certification' },
  { href: '/coaches', label: 'Find a Coach' },
  { href: '/events', label: 'Programs' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

type HeaderProps = {
  siteName?: string;
  logoUrl?: string | null;
  isAuthenticated?: boolean;
  navItems?: Array<{
    href: string;
    label: string;
  }>;
};

export function Header({
  siteName = 'WIAL Global',
  logoUrl,
  isAuthenticated = false,
  navItems = defaultNavItems,
}: HeaderProps) {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-wordmark" href="/">
          {logoUrl ? (
            <span className="site-wordmark__with-logo">
              <img alt="" className="site-wordmark__logo" src={logoUrl} />
              <span>{siteName}</span>
            </span>
          ) : (
            siteName
          )}
        </Link>

        <nav aria-label="Primary" className="site-nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <button aria-label="Search" className="site-search" type="button">
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <HeaderAuthButton isAuthenticated={isAuthenticated} />

          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
