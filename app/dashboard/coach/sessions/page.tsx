export const revalidate = 30;

import { requireCoach } from '@/lib/auth/server';
import SessionLogForm from '@/components/coaches/SessionLogForm';

export default async function CoachSessionsPage() {
  const { coach: me } = await requireCoach();

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Session Logs</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Log your coaching hours to track progress toward the 100-hour PALC advancement requirement.
        </p>
      </div>
      <SessionLogForm coachId={me.id} currentTotal={me.total_session_hours ?? 0} />
    </>
  );
}
