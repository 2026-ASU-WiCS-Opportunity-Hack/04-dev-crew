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
  const done = pct >= 100;

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
    if (json.ok) {
      setCredits((prev) => [json.data, ...prev]);
    } else {
      console.error(json.error);
    }

    setForm({ activity_name: '', credits_earned: '', completion_date: '', documentation_url: '' });
    setSaving(false);
  }

  return (
    <div>
      {/* Progress */}
      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Recertification Progress</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: done ? '#15803d' : 'var(--accent)' }}>
            {total} / {RECERT_REQUIREMENT} credits
          </span>
        </div>
        <div className="progress-wrap progress-wrap--sm">
          <div
            className={`progress-fill ${done ? 'progress-fill--green' : 'progress-fill--accent'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="form-hint" style={{ marginTop: 8 }}>
          {done
            ? '🎉 CE credit requirement met for recertification!'
            : `${RECERT_REQUIREMENT - total} more credits needed for recertification.`}
        </p>
        <a
          href="https://lms.wial.org"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: 10, fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}
        >
          Browse CE courses on WIAL LMS →
        </a>
      </div>

      {/* Add credit form */}
      <form onSubmit={handleAdd} className="form-section">
        <h3>Add CE Credit</h3>
        <div className="form-grid-2" style={{ marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Activity Name *</label>
            <input className="form-input" value={form.activity_name} onChange={(e) => update('activity_name', e.target.value)} placeholder="e.g. WIAL Global Conference 2026" required />
          </div>
          <div>
            <label className="form-label">Credits Earned *</label>
            <input type="number" className="form-input" min="0.5" step="0.5" value={form.credits_earned} onChange={(e) => update('credits_earned', e.target.value)} placeholder="e.g. 4" required />
          </div>
          <div>
            <label className="form-label">Completion Date *</label>
            <input type="date" className="form-input" value={form.completion_date} onChange={(e) => update('completion_date', e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Documentation URL (optional)</label>
            <input type="url" className="form-input" value={form.documentation_url} onChange={(e) => update('documentation_url', e.target.value)} placeholder="https://... (link to certificate or proof)" />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="button-primary"
          style={{ opacity: saving ? 0.65 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Adding…' : '+ Add Credit'}
        </button>
      </form>

      {/* Credits table */}
      <div className="form-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Credit History</h3>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>Loading credits…</div>
        ) : credits.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>No CE credits logged yet. Add your first activity above.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Activity', 'Credits', 'Date', 'Proof'].map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {credits.map((c) => (
                  <tr key={c.id}>
                    <td>{c.activity_name}</td>
                    <td style={{ fontWeight: 700 }}>{c.credits_earned}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(c.completion_date).toLocaleDateString()}</td>
                    <td>
                      {c.documentation_url
                        ? <a href={c.documentation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>View →</a>
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
