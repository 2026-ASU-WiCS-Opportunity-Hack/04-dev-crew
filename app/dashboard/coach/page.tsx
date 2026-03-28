import Link from 'next/link';
import { MOCK_COACHES } from '@/components/coaches/mock-data';
import CertBadge from '@/components/coaches/CertBadge';

// Mock: logged-in coach is Craig Senecal (id=1)
const ME = MOCK_COACHES.find((c) => c.id === '1')!;
const SESSION_HOURS = 55;
const CE_CREDITS = 16;
const PALC_REQUIRED = 100;
const CE_REQUIRED = 30;

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link href={href} style={{ display: 'block', padding: '10px 14px', borderRadius: 8, textDecoration: 'none', fontWeight: active ? 700 : 500, fontSize: '0.88rem', color: active ? 'var(--accent)' : 'var(--muted)', background: active ? 'rgba(13,92,99,0.08)' : 'transparent' }}>
      {label}
    </Link>
  );
}

function StatCard({ label, value, sub, href }: { label: string; value: string; sub?: string; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: '20px 22px', transition: 'box-shadow 0.15s', cursor: 'pointer' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(13,92,99,0.1)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = 'none')}>
        <p style={{ margin: '0 0 4px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</p>
        <p style={{ margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--muted)' }}>{sub}</p>}
      </div>
    </Link>
  );
}

export default function CoachDashboardPage() {
  const expiryDate = ME.certification_expiry
    ? new Date(ME.certification_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const daysUntilExpiry = ME.certification_expiry
    ? Math.ceil((new Date(ME.certification_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <nav style={{ padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card)', borderBottom: '1px solid rgba(28,43,51,0.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <Link href="/" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent)', textDecoration: 'none' }}>WIAL</Link>
        <div style={{ display: 'flex', gap: 24, fontSize: '0.9rem' }}>
          <Link href="/coaches" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Directory</Link>
          <Link href="/dashboard/coach" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>My Dashboard</Link>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: 'var(--card)', borderRight: '1px solid rgba(28,43,51,0.08)', padding: '24px 12px', flexShrink: 0 }}>
          <div style={{ padding: '0 10px 20px', borderBottom: '1px solid rgba(28,43,51,0.08)', marginBottom: 12 }}>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.9rem' }}>{ME.full_name}</p>
            <CertBadge level={ME.certification_level} />
          </div>
          <NavLink href="/dashboard/coach" label="📊 Overview" active />
          <NavLink href="/dashboard/coach/profile" label="✏️ Edit Profile" />
          <NavLink href="/dashboard/coach/sessions" label="⏱ Session Logs" />
          <NavLink href="/dashboard/coach/credits" label="🎓 CE Credits" />
          <NavLink href={`/coaches/${ME.id}`} label="👁 Public Profile" />
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: 900 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800 }}>Welcome back, {ME.full_name.split(' ')[0]} 👋</h1>
          <p style={{ margin: '0 0 28px', color: 'var(--muted)', fontSize: '0.9rem' }}>Here's your coaching activity at a glance.</p>

          {/* Expiry alert */}
          {isExpiringSoon && (
            <div style={{ marginBottom: 24, padding: '12px 16px', background: '#fef9c3', border: '1px solid #fef08a', borderRadius: 10, fontSize: '0.88rem', color: '#a16207', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠️ <strong>Certification expiring soon</strong> — {daysUntilExpiry} days left ({expiryDate}). Ensure your CE credits are up to date.
            </div>
          )}

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Certification" value={ME.certification_level} sub={`Expires ${expiryDate}`} href="/dashboard/coach/profile" />
            <StatCard label="Session Hours" value={`${SESSION_HOURS}h`} sub={`${PALC_REQUIRED - SESSION_HOURS}h to PALC`} href="/dashboard/coach/sessions" />
            <StatCard label="CE Credits" value={`${CE_CREDITS}`} sub={`${CE_REQUIRED - CE_CREDITS} more for recert`} href="/dashboard/coach/credits" />
            <StatCard label="Specializations" value={`${(ME.specializations ?? []).length}`} sub="tags on your profile" href="/dashboard/coach/profile" />
          </div>

          {/* Profile preview */}
          <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Your Profile</h2>
              <Link href="/dashboard/coach/profile" style={{ fontSize: '0.85rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Edit →</Link>
            </div>
            <p style={{ margin: '0 0 12px', fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--muted)' }}>{ME.bio_enhanced?.slice(0, 200)}…</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(ME.specializations ?? []).slice(0, 5).map((tag) => (
                <span key={tag} style={{ padding: '2px 10px', borderRadius: 999, background: 'rgba(13,92,99,0.08)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
