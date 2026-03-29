import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';

const navItems = [
  { href: '/certification', label: 'Certification' },
  { href: '/coaches', label: 'Find a Coach' },
  { href: '/events', label: 'Programs' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="site-wordmark" href="/">
          WIAL Global
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

          <Link className="site-header__cta" href="/login">
            Login
          </Link>

          <MobileNav items={navItems} />
        </div>
      </div>
    </header>
  );
}
