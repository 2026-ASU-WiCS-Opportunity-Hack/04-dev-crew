export const revalidate = 30;

import Link from 'next/link';
import { getCoach } from '@/lib/data/coach';
import CoachProfileEditor from '@/components/coaches/CoachProfileEditor';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachProfilePage() {
  const me = await getCoach(CRAIG_UUID);

  if (!me) {
    return <div className="coaches-empty"><p>Coach profile not found.</p></div>;
  }

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
