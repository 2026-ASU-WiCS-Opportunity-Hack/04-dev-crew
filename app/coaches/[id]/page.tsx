import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MOCK_COACHES } from '@/components/coaches/mock-data';
import CoachProfile from '@/components/coaches/CoachProfile';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return MOCK_COACHES.map((c) => ({ id: c.id }));
}

export default function CoachProfilePage({ params }: Props) {
  const coach = MOCK_COACHES.find((c) => c.id === params.id);
  if (!coach) notFound();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderBottom: '1px solid rgba(28,43,51,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>WIAL</Link>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.9rem' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Home</Link>
          <Link href="/coaches" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>Coaches</Link>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--muted)' }}>My Dashboard</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        <CoachProfile coach={coach} />
      </main>
    </div>
  );
}
