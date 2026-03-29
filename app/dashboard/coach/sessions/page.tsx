export const revalidate = 30;

import { getCoach } from '@/lib/data/coach';
import SessionLogForm from '@/components/coaches/SessionLogForm';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachSessionsPage() {
  const me = await getCoach(CRAIG_UUID);

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Session Logs</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Log your coaching hours to track progress toward the 100-hour PALC advancement requirement.
        </p>
      </div>
      <SessionLogForm coachId={CRAIG_UUID} currentTotal={me?.total_session_hours ?? 0} />
    </>
  );
}
