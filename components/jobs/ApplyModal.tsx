'use client';

import { useState } from 'react';
import type { JobListingRecord } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', project: 'Project',
};

interface ApplyModalProps {
  listing: JobListingRecord;
  coachId: string;
  onClose: () => void;
  onSuccess: (listingId: string) => void;
}

export default function ApplyModal({ listing, coachId, onClose, onSuccess }: ApplyModalProps) {
  const [coverNote, setCoverNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deadline = listing.apply_deadline
    ? new Date(listing.apply_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${listing.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coachId, cover_note: coverNote.trim() || null }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      onSuccess(listing.id);
      onClose();
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, backdropFilter: 'blur(2px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000, width: '100%', maxWidth: 540,
        background: 'var(--surface)', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', margin: '0 1rem',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Job Application
          </p>
          <h2 style={{ margin: '0 0 0.2rem', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {listing.title}
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>{listing.organization}</p>
        </div>

        {/* Job summary */}
        <div style={{ background: 'var(--surface-muted)', borderRadius: 10, padding: '1rem 1.1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem' }}>
            <span style={{ color: 'var(--muted)', minWidth: 20 }}>💼</span>
            <span>{TYPE_LABELS[listing.engagement_type]} · {listing.is_remote ? 'Remote' : (listing.location ?? 'Location TBD')}</span>
          </div>
          {listing.compensation && (
            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>💰</span>
              <span>{listing.compensation}</span>
            </div>
          )}
          {deadline && (
            <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>⏰</span>
              <span>Apply by {deadline}</span>
            </div>
          )}
        </div>

        {/* Cover note */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="cover-note">
            Cover Note <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="cover-note"
            className="form-input"
            style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit' }}
            placeholder="Briefly describe your experience and why you are a strong fit for this opportunity…"
            value={coverNote}
            onChange={(e) => setCoverNote(e.target.value)}
          />
          <p className="form-hint">Your certification level and profile will be shared with the organization.</p>
        </div>

        {error && (
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#dc2626', background: '#fee2e2', padding: '0.6rem 0.9rem', borderRadius: 8 }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} className="button-secondary" style={{ fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="button-primary" style={{ fontSize: '0.88rem', minWidth: 140 }}>
            {loading ? 'Submitting…' : 'Submit Application'}
          </button>
        </div>
      </div>
    </>
  );
}
