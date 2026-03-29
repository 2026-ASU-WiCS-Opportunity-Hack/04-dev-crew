'use client';

import Link from 'next/link';

type MobileNavProps = {
  items: Array<{
    href: string;
    label: string;
  }>;
};

export function MobileNav({ items }: MobileNavProps) {
  return (
    <div className="mobile-nav">
      <details>
        <summary aria-label="Open navigation">
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
            <path d="M3 6h18" />
            <path d="M3 12h18" />
            <path d="M3 18h18" />
          </svg>
        </summary>

        <div className="mobile-nav__panel">
          {items.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </details>
    </div>
  );
}
