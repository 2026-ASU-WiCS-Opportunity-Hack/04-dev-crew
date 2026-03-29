'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { JobListingRecord } from '@/lib/types';

const ENGAGEMENT_OPTIONS = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'project', label: 'Project-based' },
];

interface CreateJobFormProps {
  mode: 'create' | 'edit';
  chapterId: string;
  initialValues?: Partial<JobListingRecord>;
}

export default function CreateJobForm({ mode, chapterId, initialValues }: CreateJobFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    organization: initialValues?.organization ?? '',
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    engagement_type: initialValues?.engagement_type ?? 'contract',
    location: initialValues?.location ?? '',
    is_remote: initialValues?.is_remote ?? false,
    compensation: initialValues?.compensation ?? '',
    requirements: initialValues?.requirements ?? '',
    apply_deadline: initialValues?.apply_deadline
      ? new Date(initialValues.apply_deadline).toISOString().slice(0, 16)
      : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      chapter_id: chapterId,
      location: form.location.trim() || null,
      compensation: form.compensation.trim() || null,
      requirements: form.requirements.trim() || null,
      apply_deadline: form.apply_deadline ? new Date(form.apply_deadline).toISOString() : null,
    };

    try {
      const url = mode === 'create' ? '/api/jobs' : `/api/jobs/${initialValues?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.error ?? 'Something went wrong.');
        setLoading(false);
        return;
      }
      router.push('/dashboard/chapter/jobs');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="dash-card">
        <div className="dash-card__header">
          <h2 className="dash-card__title">Listing Details</h2>
        </div>
        <div className="dash-card__body">
          <div className="form-grid-2">
            <div className="form-section">
              <label className="form-label" htmlFor="organization">Organization Name *</label>
              <input id="organization" className="form-input" required value={form.organization} onChange={(e) => update('organization', e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div className="form-section">
              <label className="form-label" htmlFor="title">Job Title *</label>
              <input id="title" className="form-input" required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Action Learning Coach" />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="description">Description *</label>
            <textarea id="description" className="form-input" required style={{ minHeight: 140, resize: 'vertical', fontFamily: 'inherit' }} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the role, responsibilities, and what the organization is looking for…" />
          </div>

          <div className="form-grid-2">
            <div className="form-section">
              <label className="form-label" htmlFor="engagement_type">Engagement Type *</label>
              <select id="engagement_type" className="form-input" value={form.engagement_type} onChange={(e) => update('engagement_type', e.target.value)}>
                {ENGAGEMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-section">
              <label className="form-label" htmlFor="compensation">Compensation</label>
              <input id="compensation" className="form-input" value={form.compensation} onChange={(e) => update('compensation', e.target.value)} placeholder="e.g. $150/hr or $5,000/project" />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-section">
              <label className="form-label" htmlFor="location">Location</label>
              <input id="location" className="form-input" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="e.g. New York, NY" disabled={form.is_remote} />
            </div>
            <div className="form-section" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_remote} onChange={(e) => update('is_remote', e.target.checked)} />
                Remote position
              </label>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-section">
              <label className="form-label" htmlFor="apply_deadline">Application Deadline</label>
              <input id="apply_deadline" type="datetime-local" className="form-input" value={form.apply_deadline} onChange={(e) => update('apply_deadline', e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" htmlFor="requirements">Requirements</label>
            <textarea id="requirements" className="form-input" style={{ minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }} value={form.requirements} onChange={(e) => update('requirements', e.target.value)} placeholder="Specific certifications, experience, or skills required…" />
            <p className="form-hint">Leave blank if there are no specific requirements beyond WIAL certification.</p>
          </div>
        </div>
      </div>

      {error && (
        <p style={{ margin: '1rem 0', fontSize: '0.85rem', color: '#dc2626', background: '#fee2e2', padding: '0.75rem 1rem', borderRadius: 8 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button type="button" onClick={() => router.push('/dashboard/chapter/jobs')} className="button-secondary" style={{ fontSize: '0.88rem' }}>
          Cancel
        </button>
        <button type="submit" disabled={loading} className="button-primary" style={{ fontSize: '0.88rem', minWidth: 140 }}>
          {loading ? 'Saving…' : mode === 'create' ? 'Post Job' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
