export const revalidate = 30;

import Link from 'next/link';
import { getCoach } from '@/lib/data/coach';
import RecertificationActions from '@/components/coaches/RecertificationActions';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

const CERT_REQUIREMENTS: Record<string, { sessionHours: number; ceCredits: number; cycleYears: number; description: string }> = {
  CALC: { sessionHours: 100, ceCredits: 30, cycleYears: 2, description: 'Entry-level certification. 32+ hours of training required initially.' },
  PALC: { sessionHours: 100, ceCredits: 30, cycleYears: 2, description: 'Professional level. Must complete 100 coaching hours from CALC level.' },
  SALC: { sessionHours: 0, ceCredits: 30, cycleYears: 2, description: 'Senior level. Can train and mentor CALC candidates.' },
  MALC: { sessionHours: 0, ceCredits: 30, cycleYears: 2, description: 'Master level. Highest certification level in WIAL.' },
};

export default async function RecertificationPage() {
  const coach = await getCoach(CRAIG_UUID);

  if (!coach) {
    return <div className="coaches-empty"><p>Coach profile not found.</p></div>;
  }

  const req = CERT_REQUIREMENTS[coach.certification_level] ?? CERT_REQUIREMENTS.CALC;
  const sessionHours = coach.total_session_hours ?? 0;
  const ceCredits = coach.total_ce_credits ?? 0;
  const sessionMet = req.sessionHours === 0 || sessionHours >= req.sessionHours;
  const creditsMet = ceCredits >= req.ceCredits;

  const expiryDate = coach.certification_expiry
    ? new Date(coach.certification_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const daysLeft = coach.certification_expiry
    ? Math.ceil((new Date(coach.certification_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const sessionPct = req.sessionHours > 0 ? Math.min(100, Math.round((sessionHours / req.sessionHours) * 100)) : 100;
  const creditsPct = Math.min(100, Math.round((ceCredits / req.ceCredits) * 100));

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Recertification
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Track your progress toward {coach.certification_level} recertification ({req.cycleYears}-year cycle).
        </p>
      </div>

      {/* Expiry alert */}
      {daysLeft !== null && daysLeft <= 90 && daysLeft > 0 && (
        <div className="dash-alert" style={{ marginBottom: '1.5rem' }}>
          ⚠️ <strong>Certification expires in {daysLeft} days</strong> — {expiryDate}. Complete your requirements and submit your application.
        </div>
      )}
      {daysLeft !== null && daysLeft <= 0 && (
        <div className="dash-alert" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', marginBottom: '1.5rem' }}>
          ✕ <strong>Certification expired</strong> on {expiryDate}. Contact your chapter lead to reinstate.
        </div>
      )}

      {/* Certification info */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card__header">
          <h2 className="dash-card__title">{coach.certification_level} Certification</h2>
          {expiryDate && (
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Expires {expiryDate}
            </span>
          )}
        </div>
        <div className="dash-card__body">
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>
            {req.description}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Cycle Length</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{req.cycleYears} years</p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>CE Credits Required</p>
              <p style={{ margin: 0, fontWeight: 700 }}>{req.ceCredits} credits</p>
            </div>
            {req.sessionHours > 0 && (
              <div>
                <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Session Hours Required</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{req.sessionHours} hours</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card__header">
          <h2 className="dash-card__title">Requirements Checklist</h2>
          <span style={{ fontSize: '0.82rem', color: sessionMet && creditsMet ? '#15803d' : 'var(--muted)', fontWeight: 700 }}>
            {sessionMet && creditsMet ? '✓ All requirements met' : 'In progress'}
          </span>
        </div>
        <div className="dash-card__body">
          <div className="recert-checklist">

            {/* CE Credits */}
            <div className={`recert-requirement${creditsMet ? ' recert-requirement--met' : ' recert-requirement--pending'}`}>
              <span className="recert-requirement__icon">{creditsMet ? '✅' : '🔄'}</span>
              <div style={{ flex: 1 }}>
                <p className="recert-requirement__label">
                  Continuing Education Credits — {ceCredits} / {req.ceCredits}
                </p>
                <p className="recert-requirement__sub">
                  {creditsMet ? 'Requirement met.' : `${req.ceCredits - ceCredits} more credits needed.`}
                  {' '}<Link href="/dashboard/coach/credits" style={{ color: 'var(--accent)', fontWeight: 600 }}>Manage CE Credits →</Link>
                </p>
                <div className="progress-wrap progress-wrap--sm" style={{ marginTop: '0.5rem' }}>
                  <div
                    className={`progress-fill ${creditsMet ? 'progress-fill--green' : 'progress-fill--accent'}`}
                    style={{ width: `${creditsPct}%` }}
                  />
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: creditsMet ? '#15803d' : 'var(--muted)', minWidth: '2.5rem', textAlign: 'right' }}>
                {creditsPct}%
              </span>
            </div>

            {/* Session hours (only for CALC/PALC) */}
            {req.sessionHours > 0 && (
              <div className={`recert-requirement${sessionMet ? ' recert-requirement--met' : ' recert-requirement--pending'}`}>
                <span className="recert-requirement__icon">{sessionMet ? '✅' : '🔄'}</span>
                <div style={{ flex: 1 }}>
                  <p className="recert-requirement__label">
                    Coaching Session Hours — {sessionHours} / {req.sessionHours}
                  </p>
                  <p className="recert-requirement__sub">
                    {sessionMet ? 'Requirement met.' : `${req.sessionHours - sessionHours} more hours needed for PALC advancement.`}
                    {' '}<Link href="/dashboard/coach/sessions" style={{ color: 'var(--accent)', fontWeight: 600 }}>Log Sessions →</Link>
                  </p>
                  <div className="progress-wrap progress-wrap--sm" style={{ marginTop: '0.5rem' }}>
                    <div
                      className={`progress-fill ${sessionMet ? 'progress-fill--green' : 'progress-fill--accent'}`}
                      style={{ width: `${sessionPct}%` }}
                    />
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: sessionMet ? '#15803d' : 'var(--muted)', minWidth: '2.5rem', textAlign: 'right' }}>
                  {sessionPct}%
                </span>
              </div>
            )}

            {/* Active membership */}
            <div className="recert-requirement recert-requirement--met">
              <span className="recert-requirement__icon">📋</span>
              <div style={{ flex: 1 }}>
                <p className="recert-requirement__label">Active Membership</p>
                <p className="recert-requirement__sub">
                  Membership must be current at time of recertification.
                  {' '}<Link href="/dashboard/coach/membership" style={{ color: 'var(--accent)', fontWeight: 600 }}>View Membership →</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Recertification application */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Recertification Application</h2>
        </div>
        <div className="dash-card__body">
          <p style={{ margin: '0 0 1rem', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>
            Once all requirements are met, submit your recertification application to your chapter lead.
            The executive director reviews and approves all certification renewals.
          </p>
          <RecertificationActions allMet={sessionMet && creditsMet} />
          {(!sessionMet || !creditsMet) && (
            <p className="form-hint" style={{ marginTop: '0.75rem' }}>
              Complete all requirements above before submitting your application.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
