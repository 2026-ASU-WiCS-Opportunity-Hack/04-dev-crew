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
    if (json.ok) {
      setLogs((prev) => [json.data, ...prev]);
    } else {
      console.error(json.error);
    }

    setForm({ session_date: '', duration_hours: '', client_description: '', notes: '' });
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(28,43,51,0.15)', background: 'var(--bg)', fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.83rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Progress bar */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>PALC Advancement Progress</span>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
              {pct >= 100 ? '🎉 100-hour requirement met! You are eligible for PALC advancement.' : `${PALC_REQUIREMENT - displayTotal} more hours required for PALC advancement.`}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 800, fontSize: '2rem', lineHeight: 1, color: pct >= 100 ? '#15803d' : 'var(--accent)' }}>
              {displayTotal}
            </span>
            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--muted)' }}> / {PALC_REQUIREMENT} hrs</span>
          </div>
        </div>
        <div style={{ background: 'rgba(28,43,51,0.08)', borderRadius: 999, height: 16, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#15803d' : 'var(--accent)', borderRadius: 999, transition: 'width 0.4s', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            {pct > 10 && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>{pct}%</span>}
          </div>
        </div>
      </div>

      {/* Log session form */}
      <form onSubmit={handleAdd} style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Log a Session</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Session Date *</label>
            <input type="date" style={inputStyle} value={form.session_date} onChange={(e) => update('session_date', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Duration (hours) *</label>
            <input type="number" style={inputStyle} min="0.5" max="8" step="0.5" value={form.duration_hours} onChange={(e) => update('duration_hours', e.target.value)} placeholder="e.g. 2.5" required />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Client Description * (no PII — e.g. "banking sector team")</label>
          <input style={inputStyle} value={form.client_description} onChange={(e) => update('client_description', e.target.value)} placeholder="e.g. Government agency HR team" required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Observations, breakthroughs, areas to improve..." />
        </div>
        <button type="submit" disabled={saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Logging…' : '+ Log Session'}
        </button>
      </form>

      {/* History table */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,43,51,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Session History</h3>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>Loading sessions…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>No sessions logged yet. Add your first session above.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Date', 'Hours', 'Client', 'Notes'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderTop: '1px solid rgba(28,43,51,0.06)' }}>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{new Date(log.session_date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{log.duration_hours}h</td>
                    <td style={{ padding: '12px 16px' }}>{log.client_description}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>{log.notes || '—'}</td>
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
