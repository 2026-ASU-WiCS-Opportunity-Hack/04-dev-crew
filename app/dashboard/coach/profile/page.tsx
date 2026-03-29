export const revalidate = 30;

import { requireCoach } from '@/lib/auth/server';
import CoachProfileEditor from '@/components/coaches/CoachProfileEditor';

export default async function CoachProfilePage() {
  const { coach: me } = await requireCoach();

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Edit Profile</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Your profile is your public-facing page. Use "Enhance with AI" to generate a professional bio.
        </p>
      </div>
      <CoachProfileEditor coach={me} />
    </>
  );
}
