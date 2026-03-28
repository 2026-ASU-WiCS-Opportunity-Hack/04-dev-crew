'use client';

import { useState } from 'react';

interface CeCredit {
  id: string;
  activity_name: string;
  credits_earned: number;
  completion_date: string;
  documentation_url: string;
}

const MOCK_CREDITS: CeCredit[] = [
  { id: 'c1', activity_name: 'WIAL Global Conference 2025', credits_earned: 8, completion_date: '2025-06-20', documentation_url: '' },
  { id: 'c2', activity_name: 'Advanced Action Learning Facilitation Webinar', credits_earned: 3, completion_date: '2025-09-14', documentation_url: 'https://lms.wial.org/cert/c2' },
  { id: 'c3', activity_name: 'Cross-Cultural Coaching Module', credits_earned: 5, completion_date: '2025-11-05', documentation_url: '' },
];

const RECERT_REQUIREMENT = 30;

export default function CeCreditsTracker() {
  const [credits, setCredits] = useState<CeCredit[]>(MOCK_CREDITS);
  const [form, setForm] = useState({ activity_name: '', credits_earned: '', completion_date: '', documentation_url: '' });
  const [saving, setSaving] = useState(false);

  const total = credits.reduce((sum, c) => sum + c.credits_earned, 0);
  const pct = Math.min(100, Math.round((total / RECERT_REQUIREMENT) * 100));

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.activity_name || !form.credits_earned || !form.completion_date) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setCredits((prev) => [
      { id: Date.now().toString(), activity_name: form.activity_name, credits_earned: parseFloat(form.credits_earned), completion_date: form.completion_date, documentation_url: form.documentation_url },
      ...prev,
    ]);
    setForm({ activity_name: '', credits_earned: '', completion_date: '', documentation_url: '' });
    setSaving(false);
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid rgba(28,43,51,0.15)', background: 'var(--bg)', fontSize: '0.9rem', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 5, fontWeight: 600, fontSize: '0.83rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Progress bar */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Recertification Progress</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: pct >= 100 ? '#15803d' : 'var(--accent)' }}>
            {total} / {RECERT_REQUIREMENT} credits
          </span>
        </div>
        <div style={{ background: 'rgba(28,43,51,0.08)', borderRadius: 999, height: 12, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 100 ? '#15803d' : '#1a56db', borderRadius: 999, transition: 'width 0.4s' }} />
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
          {pct >= 100
            ? '🎉 CE credit requirement met for recertification!'
            : `${RECERT_REQUIREMENT - total} more credits needed for recertification.`}
        </p>
        <a href="https://lms.wial.org" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600 }}>
          Browse CE courses on WIAL LMS →
        </a>
      </div>

      {/* Add credit form */}
      <form onSubmit={handleAdd} style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, padding: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Add CE Credit</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Activity Name *</label>
            <input style={inputStyle} value={form.activity_name} onChange={(e) => update('activity_name', e.target.value)} placeholder="e.g. WIAL Global Conference 2026" required />
          </div>
          <div>
            <label style={labelStyle}>Credits Earned *</label>
            <input type="number" style={inputStyle} min="0.5" step="0.5" value={form.credits_earned} onChange={(e) => update('credits_earned', e.target.value)} placeholder="e.g. 4" required />
          </div>
          <div>
            <label style={labelStyle}>Completion Date *</label>
            <input type="date" style={inputStyle} value={form.completion_date} onChange={(e) => update('completion_date', e.target.value)} required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Documentation URL (optional)</label>
            <input type="url" style={inputStyle} value={form.documentation_url} onChange={(e) => update('documentation_url', e.target.value)} placeholder="https://... (link to certificate or proof)" />
          </div>
        </div>
        <button type="submit" disabled={saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: saving ? '#94a3b8' : '#1a56db', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Adding…' : '+ Add Credit'}
        </button>
      </form>

      {/* Credits table */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(28,43,51,0.08)' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Credit History</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Activity', 'Credits', 'Date', 'Proof'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {credits.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid rgba(28,43,51,0.06)' }}>
                  <td style={{ padding: '12px 16px' }}>{c.activity_name}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>{c.credits_earned}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{new Date(c.completion_date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {c.documentation_url
                      ? <a href={c.documentation_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>View →</a>
                      : <span style={{ color: 'var(--muted)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
