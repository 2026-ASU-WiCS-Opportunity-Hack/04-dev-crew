import Link from 'next/link';
import CeCreditsTracker from '@/components/coaches/CeCreditsTracker';

export default function CoachCreditsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderBottom: '1px solid rgba(28,43,51,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>WIAL</Link>
        <div style={{ display: 'flex', gap: 20, fontSize: '0.88rem' }}>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--muted)' }}>← Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 6px', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coach Dashboard</p>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', fontWeight: 800 }}>Continuing Education Credits</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
            Track CE credits earned toward your recertification cycle. Browse available courses on the WIAL LMS.
          </p>
        </div>

        <CeCreditsTracker />
      </main>
    </div>
  );
}
