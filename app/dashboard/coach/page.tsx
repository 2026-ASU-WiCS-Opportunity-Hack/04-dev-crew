export const revalidate = 30;

import Link from 'next/link';
import { requireCoach } from '@/lib/auth/server';

export default async function CoachDashboardPage() {
  const { coach: me } = await requireCoach();

  const PALC_REQUIRED = 100;
  const CE_REQUIRED = 30;
  const sessionHours = me.total_session_hours ?? 0;
  const ceCredits = me.total_ce_credits ?? 0;

  const expiryDate = me.certification_expiry
    ? new Date(me.certification_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const daysUntilExpiry = me.certification_expiry
    ? Math.ceil((new Date(me.certification_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 90;

  return (
    <>
      <h1 className="dash-heading">Welcome back, {me.full_name.split(' ')[0]} 👋</h1>
      <p className="dash-subtext">Here's your coaching activity at a glance.</p>

      {isExpiringSoon && (
        <div className="dash-alert">
          ⚠️ <strong>Certification expiring soon</strong> — {daysUntilExpiry} days left ({expiryDate}). Ensure your CE credits are up to date.
        </div>
      )}

      <div className="dash-stat-grid">
        <Link href="/dashboard/coach/profile" className="dash-stat-card">
          <p className="dash-stat-card__label">Certification</p>
          <p className="dash-stat-card__value">{me.certification_level}</p>
          <p className="dash-stat-card__sub">Expires {expiryDate}</p>
        </Link>
        <Link href="/dashboard/coach/sessions" className="dash-stat-card">
          <p className="dash-stat-card__label">Session Hours</p>
          <p className="dash-stat-card__value">{sessionHours}h</p>
          <p className="dash-stat-card__sub">{PALC_REQUIRED - sessionHours}h to PALC</p>
        </Link>
        <Link href="/dashboard/coach/credits" className="dash-stat-card">
          <p className="dash-stat-card__label">CE Credits</p>
          <p className="dash-stat-card__value">{ceCredits}</p>
          <p className="dash-stat-card__sub">{CE_REQUIRED - ceCredits} more for recert</p>
        </Link>
        <Link href="/dashboard/coach/profile" className="dash-stat-card">
          <p className="dash-stat-card__label">Specializations</p>
          <p className="dash-stat-card__value">{(me.specializations ?? []).length}</p>
          <p className="dash-stat-card__sub">tags on your profile</p>
        </Link>
      </div>

      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Your Profile</h2>
          <Link href="/dashboard/coach/profile" className="dash-card__link">Edit →</Link>
        </div>
        <div className="dash-card__body">
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--muted)' }}>
            {(me.bio_enhanced ?? me.bio_raw ?? '').slice(0, 220)}…
          </p>
          <div className="coach-card__tags">
            {(me.specializations ?? []).slice(0, 5).map((tag) => (
              <span key={tag} className="coach-card__tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
