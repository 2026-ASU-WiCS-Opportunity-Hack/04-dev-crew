import CeCreditsTracker from '@/components/coaches/CeCreditsTracker';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default function CoachCreditsPage() {
  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>CE Credits</h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Track continuing education credits earned toward your recertification cycle.
        </p>
      </div>
      <CeCreditsTracker coachId={CRAIG_UUID} />
    </>
  );
}
