'use client';

import { useState, useEffect } from 'react';

interface CeCredit {
  id: string;
  activity_name: string;
  credits_earned: number;
  completion_date: string;
  documentation_url: string;
}

const RECERT_REQUIREMENT = 30;

interface CeCreditsTrackerProps {
  coachId: string;
}

export default function CeCreditsTracker({ coachId }: CeCreditsTrackerProps) {
  const [credits, setCredits] = useState<CeCredit[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ activity_name: '', credits_earned: '', completion_date: '', documentation_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/credits?coach_id=${coachId}`)
      .then((r) => r.json())
      .then(({ data, ok }) => {
        if (ok) setCredits(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [coachId]);

  const total = credits.reduce((sum, c) => sum + c.credits_earned, 0);
  const pct = Math.min(100, Math.round((total / RECERT_REQUIREMENT) * 100));

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.activity_name || !form.credits_earned || !form.completion_date) return;
    setSaving(true);

    const res = await fetch('/api/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coach_id: coachId,
        activity_name: form.activity_name,
        credits_earned: parseFloat(form.credits_earned),
        completion_date: form.completion_date,
        documentation_url: form.documentation_url,
      }),
    });

    const json = await res.json();
    if (json.ok) setCredits((prev) => [json.data, ...prev]);
    setForm({ activity_name: '', credits_earned: '', completion_date: '', documentation_url: '' });
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Progress */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Recertification Progress</h2>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: pct >= 100 ? '#15803d' : 'var(--accent)' }}>
            {total} / {RECERT_REQUIREMENT} credits
          </span>
        </div>
        <div className="dash-card__body">
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.84rem', color: 'var(--muted)' }}>
            {pct >= 100
              ? '🎉 CE credit requirement met for recertification!'
              : `${RECERT_REQUIREMENT - total} more credits needed for recertification.`}
          </p>
          <div className="progress-wrap progress-wrap--md">
            <div
              className={`progress-fill ${pct >= 100 ? 'progress-fill--green' : 'progress-fill--accent'}`}
              style={{ width: `${pct}%` }}
            >
              {pct > 12 && <span className="progress-label">{pct}%</span>}
            </div>
          </div>
          <a
            href="https://lms.wial.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}
          >
            Browse CE courses on WIAL LMS →
          </a>
        </div>
      </div>

      {/* Add credit form */}
      <form onSubmit={handleAdd} className="form-section">
        <h3>Add CE Credit</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">Activity Name *</label>
          <input className="form-input" value={form.activity_name} onChange={(e) => update('activity_name', e.target.value)} placeholder="e.g. WIAL Global Conference 2026" required />
        </div>
        <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Credits Earned *</label>
            <input type="number" className="form-input" min="0.5" step="0.5" value={form.credits_earned} onChange={(e) => update('credits_earned', e.target.value)} placeholder="e.g. 4" required />
          </div>
          <div>
            <label className="form-label">Completion Date *</label>
            <input type="date" className="form-input" value={form.completion_date} onChange={(e) => update('completion_date', e.target.value)} required />
          </div>
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Documentation URL (optional)</label>
          <input type="url" className="form-input" value={form.documentation_url} onChange={(e) => update('documentation_url', e.target.value)} placeholder="https://... (link to certificate or proof)" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="button-primary"
          style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Adding…' : '+ Add Credit'}
        </button>
      </form>

      {/* History */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Credit History</h2>
        </div>
        {loading ? (
          <div className="coaches-empty" style={{ padding: '2rem 0' }}><p>Loading credits…</p></div>
        ) : credits.length === 0 ? (
          <div className="coaches-empty" style={{ padding: '2rem 0' }}><p>No CE credits logged yet. Add your first activity above.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>{['Activity', 'Credits', 'Date', 'Proof'].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {credits.map((c) => (
                  <tr key={c.id}>
                    <td>{c.activity_name}</td>
                    <td style={{ fontWeight: 700 }}>{c.credits_earned}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.completion_date).toLocaleDateString()}</td>
                    <td>
                      {c.documentation_url
                        ? <a href={c.documentation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 600 }}>View →</a>
                        : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
