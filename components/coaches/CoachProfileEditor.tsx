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

  const [photoPreview, setPhotoPreview] = useState<string | null>(coach.photo_url ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ bio: string } | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
    setSaveError(null);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handlePhotoUpload() {
    if (!photoFile) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('photo', photoFile);
    const res = await fetch(`/api/coaches/${coach.id}/photo`, { method: 'POST', body: fd });
    const json = await res.json();
    if (json.ok) {
      setPhotoPreview(json.data.photo_url);
      setPhotoFile(null);
    } else {
      setSaveError('Photo upload failed: ' + json.error);
    }
    setUploadingPhoto(false);
  }

  async function handleEnhanceBio() {
    if (!form.bio_raw.trim()) return;
    setEnhancing(true);
    setAiSuggestion(null);
    setEnhanceError(null);

    const res = await fetch('/api/ai/enhance-bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: form.full_name,
        certificationLevel: coach.certification_level,
        location: [form.location_city, form.location_country].filter(Boolean).join(', '),
        specializations: form.specializations.split(',').map((t) => t.trim()).filter(Boolean),
        rawBio: form.bio_raw,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      setEnhanceError(json.error ?? 'AI enhancement failed. Try again.');
    } else {
      setAiSuggestion({ bio: json.data.enhancedBio });
    }
    setEnhancing(false);
  }

  function acceptAiSuggestion() {
    if (!aiSuggestion) return;
    setForm((f) => ({ ...f, bio_enhanced: aiSuggestion.bio }));
    setAiSuggestion(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setSaveError(null);

    const res = await fetch(`/api/coaches/${coach.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        bio_raw: form.bio_raw,
        bio_enhanced: form.bio_enhanced,
        location_city: form.location_city,
        location_country: form.location_country,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        linkedin_url: form.linkedin_url,
        website_url: form.website_url,
        highlight: form.highlight,
        specializations: form.specializations.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      setSaveError('Save failed: ' + (json.error ?? 'unknown error'));
    } else {
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSave}>
      {/* Cert badge (read-only) */}
      <div className="form-section" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Certification Level:</span>
        <CertBadge level={coach.certification_level} size="md" />
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginLeft: 'auto' }}>
          {coach.certification_expiry
            ? `Expires: ${new Date(coach.certification_expiry).toLocaleDateString()}`
            : ''}
        </span>
      </div>

      {/* Photo upload */}
      <section className="form-section">
        <h3>Profile Photo</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), var(--brand))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {photoPreview
              ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem' }}>
                  {coach.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
            }
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{
              display: 'inline-block', padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600,
            }}>
              Choose Photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </label>
            {photoFile && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none',
                  background: uploadingPhoto ? 'var(--muted)' : 'var(--accent)',
                  color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                }}
              >
                {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
              </button>
            )}
            <p className="form-hint">JPG, PNG or WebP. Max 5MB.</p>
          </div>
        </div>
      </section>

      {/* Basic info */}
      <section className="form-section">
        <h3>Basic Information</h3>
        <div className="form-grid-2">
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input className="form-input" type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} />
          </div>
          <div>
            <label className="form-label">City</label>
            <input className="form-input" value={form.location_city} onChange={(e) => update('location_city', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Country</label>
            <input className="form-input" value={form.location_country} onChange={(e) => update('location_country', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Phone (optional)</label>
            <input className="form-input" value={form.contact_phone} onChange={(e) => update('contact_phone', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Bio section with AI */}
      <section className="form-section">
        <h3>Bio</h3>
        <div>
          <label className="form-label">Your Raw Bio</label>
          <textarea
            className="form-input form-textarea"
            value={form.bio_raw}
            onChange={(e) => update('bio_raw', e.target.value)}
            placeholder="Write a few sentences about yourself in your own words..."
          />
          <button
            type="button"
            onClick={handleEnhanceBio}
            disabled={enhancing || !form.bio_raw.trim()}
            style={{
              marginTop: 10, padding: '9px 18px', borderRadius: 8, border: 'none',
              background: (enhancing || !form.bio_raw.trim()) ? 'var(--muted)' : 'var(--accent)',
              color: '#fff', fontWeight: 600, fontSize: '0.85rem',
              cursor: (enhancing || !form.bio_raw.trim()) ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {enhancing ? '✨ Enhancing…' : '✨ Enhance with AI'}
          </button>
          {enhanceError && <p className="form-error" style={{ marginTop: 8 }}>{enhanceError}</p>}
        </div>

        {aiSuggestion && (
          <div className="ai-suggestion">
            <p className="ai-suggestion__title">✨ AI-Generated Bio</p>
            <p className="ai-suggestion__bio">{aiSuggestion.bio}</p>
            <div className="ai-suggestion__actions">
              <button
                type="button"
                onClick={acceptAiSuggestion}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#15803d', color: '#fff', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setAiSuggestion(null)}
                style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #bbf7d0', background: 'transparent', fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label className="form-label">Enhanced Bio (public-facing)</label>
          <textarea
            className="form-input form-textarea"
            style={{ minHeight: 120 }}
            value={form.bio_enhanced}
            onChange={(e) => update('bio_enhanced', e.target.value)}
            placeholder="Your polished public bio will appear here after AI enhancement..."
          />
        </div>
      </section>

      {/* Specializations */}
      <section className="form-section">
        <h3>Specializations</h3>
        <label className="form-label">Tags (comma-separated)</label>
        <input
          className="form-input"
          value={form.specializations}
          onChange={(e) => update('specializations', e.target.value)}
          placeholder="e.g. executive coaching, healthcare, government, change management"
        />
        <p className="form-hint">These are used for semantic search matching.</p>
      </section>

      {/* Public profile links */}
      <section className="form-section">
        <h3>Public Profile Links</h3>
        <div className="form-grid-2">
          <div>
            <label className="form-label">LinkedIn URL</label>
            <input className="form-input" type="url" value={form.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="form-label">Website URL</label>
            <input className="form-input" type="url" value={form.website_url} onChange={(e) => update('website_url', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="form-label">Signature Approach / Highlight</label>
          <textarea
            className="form-input form-textarea"
            style={{ minHeight: 80 }}
            value={form.highlight}
            onChange={(e) => update('highlight', e.target.value)}
            placeholder="Describe your unique methodology or approach in 1-2 sentences..."
          />
        </div>
      </section>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button
          type="submit"
          disabled={saving}
          className="button-primary"
          style={{ opacity: saving ? 0.65 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {saved && <span className="form-success">✓ Profile saved</span>}
        {saveError && <span className="form-error">{saveError}</span>}
      </div>
    </form>
  );
}
