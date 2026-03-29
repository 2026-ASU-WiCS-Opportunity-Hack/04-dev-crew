export const revalidate = 3600; // static-ish page, rebuild once per hour

import Link from 'next/link';

const LMS_RESOURCES = [
  {
    icon: '🎓',
    label: 'WIAL Learning Management System',
    description: 'Access your courses, track CE credits, and browse new learning content.',
    href: 'https://lms.wial.org',
    external: true,
    badge: 'External LMS',
  },
  {
    icon: '📜',
    label: 'Certification Requirements',
    description: 'Full CALC, PALC, SALC, and MALC certification requirements and pathways.',
    href: '/certification',
    external: false,
    badge: null,
  },
  {
    icon: '👥',
    label: 'Global Coach Directory',
    description: 'Browse and connect with certified Action Learning coaches worldwide.',
    href: '/coaches',
    external: false,
    badge: null,
  },
  {
    icon: '📅',
    label: 'Events Calendar',
    description: 'View all upcoming global and chapter events, workshops, and conferences.',
    href: '/events',
    external: false,
    badge: null,
  },
  {
    icon: '🏅',
    label: 'Credly — Digital Badges',
    description: 'View and share your WIAL certification digital badges issued via Credly.',
    href: 'https://credly.com',
    external: true,
    badge: 'External',
  },
  {
    icon: '✉️',
    label: 'Contact WIAL Global',
    description: 'Reach out to the WIAL executive director for certification and membership questions.',
    href: '/contact',
    external: false,
    badge: null,
  },
];

const CERT_QUICK_REF = [
  { level: 'CALC', label: 'Certified Action Learning Coach', cycle: '2-year', ce: '30 credits', sessions: '100 hrs for PALC' },
  { level: 'PALC', label: 'Professional Action Learning Coach', cycle: '2-year', ce: '30 credits', sessions: '—' },
  { level: 'SALC', label: 'Senior Action Learning Coach', cycle: '2-year', ce: '30 credits', sessions: '—' },
  { level: 'MALC', label: 'Master Action Learning Coach', cycle: '2-year', ce: '30 credits', sessions: '—' },
];

export default function CoachResourcesPage() {
  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Resources
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Key links, learning materials, and certification reference guides.
        </p>
      </div>

      {/* Quick links */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card__header">
          <h2 className="dash-card__title">Quick Links</h2>
        </div>
        <div className="dash-card__body">
          <div className="resource-link-grid">
            {LMS_RESOURCES.map((res) =>
              res.external ? (
                <a key={res.label} href={res.href} target="_blank" rel="noopener noreferrer" className="resource-link-card">
                  <span className="resource-link-card__icon">{res.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p className="resource-link-card__label">
                      {res.label}
                      {res.badge && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 999, padding: '0.1rem 0.45rem' }}>
                          {res.badge}
                        </span>
                      )}
                    </p>
                    <p className="resource-link-card__sub">{res.description}</p>
                  </div>
                  <span className="resource-link-card__arrow">↗</span>
                </a>
              ) : (
                <Link key={res.label} href={res.href} className="resource-link-card">
                  <span className="resource-link-card__icon">{res.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p className="resource-link-card__label">{res.label}</p>
                    <p className="resource-link-card__sub">{res.description}</p>
                  </div>
                  <span className="resource-link-card__arrow">→</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Certification quick reference */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Certification Quick Reference</h2>
          <Link href="/certification" className="dash-card__link">Full details →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Full Name</th>
                <th>Recert Cycle</th>
                <th>CE Credits</th>
                <th>Session Hours</th>
              </tr>
            </thead>
            <tbody>
              {CERT_QUICK_REF.map((row) => (
                <tr key={row.level}>
                  <td style={{ fontWeight: 700 }}>{row.level}</td>
                  <td style={{ color: 'var(--muted)' }}>{row.label}</td>
                  <td>{row.cycle}</td>
                  <td>{row.ce}</td>
                  <td style={{ color: 'var(--muted)' }}>{row.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.35rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong>Note:</strong> Certification badges are reviewed and approved by the WIAL executive director.
            Badges are issued via Credly and are not published until approved. Initial CALC certification requires 32+ hours of training.
          </p>
        </div>
      </div>
    </>
  );
}
