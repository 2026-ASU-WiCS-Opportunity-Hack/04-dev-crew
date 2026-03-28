'use client';

import { useState } from 'react';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

interface CoachProfileEditorProps {
  coach: CoachRecord;
}

export default function CoachProfileEditor({ coach }: CoachProfileEditorProps) {
  const [form, setForm] = useState({
    full_name: coach.full_name,
    bio_raw: coach.bio_raw ?? '',
    bio_enhanced: coach.bio_enhanced ?? '',
    location_city: coach.location_city ?? '',
    location_country: coach.location_country ?? '',
    contact_email: coach.contact_email ?? '',
    contact_phone: coach.contact_phone ?? '',
    linkedin_url: coach.linkedin_url ?? '',
    website_url: coach.website_url ?? '',
    highlight: coach.highlight ?? '',
    specializations: (coach.specializations ?? []).join(', '),
  });

  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ bio: string; tags: string[] } | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleEnhanceBio() {
    if (!form.bio_raw.trim()) return;
    setEnhancing(true);
    setAiSuggestion(null);

    // Simulate AI call — swap for real API when ready:
    // const res = await fetch('/api/ai/enhance-bio', { method: 'POST', body: JSON.stringify({ fullName: form.full_name, certificationLevel: coach.certification_level, location: `${form.location_city}, ${form.location_country}`, rawBio: form.bio_raw }) });
    // const json = await res.json();

    await new Promise((r) => setTimeout(r, 2000));
    const mockEnhanced = `${form.full_name} is a ${coach.certification_level}-certified Action Learning coach based in ${form.location_city || 'their location'}. ${form.bio_raw.trim()} With a proven track record of facilitating transformative team problem-solving sessions, they bring structured methodology and deep empathy to every coaching engagement, helping leaders unlock collective intelligence and drive meaningful organizational change.`;
    const mockTags = form.specializations
      ? form.specializations.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 5)
      : ['action learning', 'leadership development', 'team coaching', 'organizational change', 'facilitation'];

    setAiSuggestion({ bio: mockEnhanced, tags: mockTags });
    setEnhancing(false);
  }

  function acceptAiSuggestion() {
    if (!aiSuggestion) return;
    setForm((f) => ({ ...f, bio_enhanced: aiSuggestion.bio, specializations: aiSuggestion.tags.join(', ') }));
    setAiSuggestion(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Simulate save — swap for real Supabase upsert when backend ready
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid rgba(28,43,51,0.15)', background: 'var(--bg)',
    fontSize: '0.9rem', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.85rem' };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cert badge (read-only) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(13,92,99,0.06)', borderRadius: 10 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Certification Level:</span>
        <CertBadge level={coach.certification_level} size="md" />
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 'auto' }}>
          {coach.certification_expiry ? `Expires: ${new Date(coach.certification_expiry).toLocaleDateString()}` : ''}
        </span>
      </div>

      {/* Basic info */}
      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Basic Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div>
            <label style={labelStyle}>Contact Email</label>
            <input style={inputStyle} type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={form.location_city} onChange={(e) => update('location_city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <input style={inputStyle} value={form.location_country} onChange={(e) => update('location_country', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Phone (optional)</label>
            <input style={inputStyle} value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Bio section with AI */}
      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Bio</h3>
        <div>
          <label style={labelStyle}>Your Raw Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
            value={form.bio_raw}
            onChange={(e) => update('bio_raw', e.target.value)}
            placeholder="Write a few sentences about yourself in your own words..."
          />
          <button
            type="button"
            onClick={handleEnhanceBio}
            disabled={enhancing || !form.bio_raw.trim()}
            style={{
              marginTop: 10, padding: '9px 18px', borderRadius: 8,
              border: 'none', background: enhancing ? '#94a3b8' : '#1a56db',
              color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: enhancing ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {enhancing ? '✨ Enhancing…' : '✨ Enhance with AI'}
          </button>
        </div>

        {/* AI suggestion */}
        {aiSuggestion && (
          <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10 }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '0.85rem', color: '#15803d' }}>✨ AI-Generated Bio</p>
            <p style={{ margin: '0 0 12px', fontSize: '0.88rem', lineHeight: 1.65 }}>{aiSuggestion.bio}</p>
            <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.8rem', color: '#15803d' }}>Suggested tags:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {aiSuggestion.tags.map((t) => (
                <span key={t} style={{ padding: '2px 10px', borderRadius: 999, background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 500 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={acceptAiSuggestion} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#15803d', color: '#fff', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}>
                Accept
              </button>
              <button type="button" onClick={() => setAiSuggestion(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #bbf7d0', background: 'transparent', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}>
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Enhanced Bio (public-facing)</label>
          <textarea
            style={{ ...inputStyle, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }}
            value={form.bio_enhanced}
            onChange={(e) => update('bio_enhanced', e.target.value)}
            placeholder="Your polished public bio will appear here after AI enhancement..."
          />
        </div>
      </section>

      {/* Specializations */}
      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Specializations</h3>
        <label style={labelStyle}>Tags (comma-separated)</label>
        <input style={inputStyle} value={form.specializations} onChange={(e) => update('specializations', e.target.value)} placeholder="e.g. executive coaching, healthcare, government, change management" />
        <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--muted)' }}>These are used for semantic search matching.</p>
      </section>

      {/* Self-advertising */}
      <section>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700 }}>Public Profile Links</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>LinkedIn URL</label>
            <input style={inputStyle} type="url" value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label style={labelStyle}>Website URL</label>
            <input style={inputStyle} type="url" value={form.website_url} onChange={(e) => update('website_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Signature Approach / Highlight</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }}
            value={form.highlight}
            onChange={(e) => update('highlight', e.target.value)}
            placeholder="Describe your unique methodology or approach in 1-2 sentences..."
          />
        </div>
      </section>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: saving ? '#94a3b8' : 'var(--accent)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>✓ Profile saved</span>}
      </div>
    </form>
  );
}
