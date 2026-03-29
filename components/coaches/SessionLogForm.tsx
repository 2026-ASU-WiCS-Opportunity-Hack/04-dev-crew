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
  const done = pct >= 100;

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
    if (json.ok) {
      setLogs((prev) => [json.data, ...prev]);
    } else {
      console.error(json.error);
    }

    setForm({ session_date: '', duration_hours: '', client_description: '', notes: '' });
    setSaving(false);
  }

  return (
    <div>
      {/* Progress */}
      <div className="form-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>PALC Advancement Progress</span>
            <p className="form-hint" style={{ marginTop: 4 }}>
              {done
                ? '🎉 100-hour requirement met! You are eligible for PALC advancement.'
                : `${PALC_REQUIREMENT - displayTotal} more hours required for PALC advancement.`}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1, color: done ? '#15803d' : 'var(--accent)' }}>
              {displayTotal}
            </span>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--muted)' }}> / {PALC_REQUIREMENT} hrs</span>
          </div>
        </div>
        <div className="progress-wrap progress-wrap--md">
          <div
            className={`progress-fill ${done ? 'progress-fill--green' : 'progress-fill--accent'}`}
            style={{ width: `${pct}%` }}
          >
            {pct > 10 && <span className="progress-label">{pct}%</span>}
          </div>
        </div>
      </div>

      {/* Log session form */}
      <form onSubmit={handleAdd} className="form-section">
        <h3>Log a Session</h3>
        <div className="form-grid-2" style={{ marginBottom: 14 }}>
          <div>
            <label className="form-label">Session Date *</label>
            <input type="date" className="form-input" value={form.session_date} onChange={(e) => update('session_date', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Duration (hours) *</label>
            <input type="number" className="form-input" min="0.5" max="8" step="0.5" value={form.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} placeholder="e.g. 2.5" required />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Client Description * <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(no PII — e.g. "banking sector team")</span></label>
          <input className="form-input" value={form.client_description} onChange={(e) => update('client_description', e.target.value)} placeholder="e.g. Government agency HR team" required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Notes (optional)</label>
          <textarea className="form-input form-textarea" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Observations, breakthroughs, areas to improve..." />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="button-primary"
          style={{ opacity: saving ? 0.65 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Logging…' : '+ Log Session'}
        </button>
      </form>

      {/* History table */}
      <div className="form-section" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0 }}>Session History</h3>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>Loading sessions…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>No sessions logged yet. Add your first session above.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  {['Date', 'Hours', 'Client', 'Notes'].map((h) => <th key={h}>{h}</th>)}
                </tr>
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
