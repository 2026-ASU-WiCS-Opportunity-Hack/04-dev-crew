import Link from 'next/link';
import { MobileNav } from '@/components/layout/MobileNav';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/certification', label: 'Certification' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link className="brand-lockup" href="/">
          <span aria-hidden="true" className="brand-lockup__mark">
            <span className="brand-lockup__bar brand-lockup__bar--olive-sm" />
            <span className="brand-lockup__bar brand-lockup__bar--olive" />
            <span className="brand-lockup__bar brand-lockup__bar--brand" />
            <span className="brand-lockup__bar brand-lockup__bar--brand-lg" />
            <span className="brand-lockup__bar brand-lockup__bar--brand-slice" />
          </span>
          <span className="brand-lockup__text">
            <strong>World Institute for Action Learning</strong>
            <span>Global Action Learning network</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="site-nav">
          {navItems.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <MobileNav items={navItems} />
      </div>
    </header>
  );
}
