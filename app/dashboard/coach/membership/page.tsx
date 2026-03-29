export const revalidate = 30;

import { requireCoach } from '@/lib/auth/server';
import MembershipCard from '@/components/coaches/MembershipCard';
import type { CoachRecord } from '@/lib/types';

function getMembershipStatus(coach: CoachRecord): 'active' | 'needs_renewal' | 'not_active' {
  if (!coach.certification_expiry) return 'not_active';
  const expiry = new Date(coach.certification_expiry);
  const now = new Date();
  if (expiry < now) return 'not_active';
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 90) return 'needs_renewal';
  return 'active';
}

export default async function CoachMembershipPage() {
  const { coach } = await requireCoach();

  const status = getMembershipStatus(coach);
  const expiryDate = coach.certification_expiry
    ? new Date(coach.certification_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const daysLeft = coach.certification_expiry
    ? Math.ceil((new Date(coach.certification_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Membership
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Manage your WIAL membership status and renew your dues.
        </p>
      </div>

      <MembershipCard
        coach={coach}
        status={status}
        expiryDate={expiryDate}
        daysLeft={daysLeft}
      />
    </>
  );
}
