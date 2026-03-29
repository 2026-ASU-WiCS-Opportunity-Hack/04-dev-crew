'use client';

import { useState, useEffect } from 'react';

interface SessionLog {
  id: string;
  session_date: string;
  duration_hours: number;
  client_description: string;
  notes: string;
}

const PALC_REQUIREMENT = 100;

interface SessionLogFormProps {
  coachId: string;
  currentTotal: number;
}

export default function SessionLogForm({ coachId }: SessionLogFormProps) {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ session_date: '', duration_hours: '', client_description: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/sessions?coach_id=${coachId}`)
      .then((r) => r.json())
      .then(({ data, ok }) => {
        if (ok) setLogs(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [coachId]);

  const displayTotal = logs.reduce((sum, l) => sum + l.duration_hours, 0);
  const pct = Math.min(100, Math.round((displayTotal / PALC_REQUIREMENT) * 100));

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.session_date || !form.duration_hours || !form.client_description) return;
    setSaving(true);

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coach_id: coachId,
        session_date: form.session_date,
        duration_hours: parseFloat(form.duration_hours),
        client_description: form.client_description,
        notes: form.notes,
      }),
    });

    const json = await res.json();
    if (json.ok) setLogs((prev) => [json.data, ...prev]);
    setForm({ session_date: '', duration_hours: '', client_description: '', notes: '' });
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Progress */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">PALC Advancement Progress</h2>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: pct >= 100 ? '#15803d' : 'var(--accent)' }}>
            {displayTotal} / {PALC_REQUIREMENT} hrs
          </span>
        </div>
        <div className="dash-card__body">
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.84rem', color: 'var(--muted)' }}>
            {pct >= 100
              ? '🎉 100-hour requirement met! You are eligible for PALC advancement.'
              : `${PALC_REQUIREMENT - displayTotal} more hours needed for PALC advancement.`}
          </p>
          <div className="progress-wrap progress-wrap--md">
            <div
              className={`progress-fill ${pct >= 100 ? 'progress-fill--green' : 'progress-fill--accent'}`}
              style={{ width: `${pct}%` }}
            >
              {pct > 12 && <span className="progress-label">{pct}%</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Log session form */}
      <form onSubmit={handleAdd} className="form-section">
        <h3>Log a Session</h3>
        <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Session Date *</label>
            <input type="date" className="form-input" value={form.session_date} onChange={(e) => update('session_date', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Duration (hours) *</label>
            <input type="number" className="form-input" min="0.5" max="8" step="0.5" value={form.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} placeholder="e.g. 2.5" required />
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            Client Description * <span className="form-hint" style={{ display: 'inline' }}>(no PII — e.g. "banking sector team")</span>
          </label>
          <input className="form-input" value={form.client_description} onChange={(e) => update('client_description', e.target.value)} placeholder="e.g. Government agency HR team" required />
        </div>
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input form-textarea" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Observations, breakthroughs, areas to improve..." />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="button-primary"
          style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Logging…' : '+ Log Session'}
        </button>
      </form>

      {/* History */}
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Session History</h2>
        </div>
        {loading ? (
          <div className="coaches-empty" style={{ padding: '2rem 0' }}><p>Loading sessions…</p></div>
        ) : logs.length === 0 ? (
          <div className="coaches-empty" style={{ padding: '2rem 0' }}><p>No sessions logged yet. Add your first session above.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>{['Date', 'Hours', 'Client', 'Notes'].map((h) => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.session_date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700 }}>{log.duration_hours}h</td>
                    <td>{log.client_description}</td>
                    <td style={{ color: 'var(--muted)' }}>{log.notes || '—'}</td>
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
