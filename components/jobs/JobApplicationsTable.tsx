'use client';

import { useState } from 'react';
import type { JobApplicationRecord, JobApplicationStatus } from '@/lib/types';

const STATUS_OPTIONS: JobApplicationStatus[] = ['pending', 'reviewed', 'shortlisted', 'declined', 'hired'];

const STATUS_STYLES: Record<JobApplicationStatus, { bg: string; color: string }> = {
  pending:     { bg: '#f3f4f6', color: '#374151' },
  reviewed:    { bg: '#dbeafe', color: '#1d4ed8' },
  shortlisted: { bg: '#ede9fe', color: '#6d28d9' },
  declined:    { bg: '#fee2e2', color: '#dc2626' },
  hired:       { bg: '#dcfce7', color: '#15803d' },
};

interface JobApplicationsTableProps {
  listingId: string;
  initialApplications: JobApplicationRecord[];
}

export default function JobApplicationsTable({ listingId, initialApplications }: JobApplicationsTableProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleStatusChange(applicationId: string, status: JobApplicationStatus) {
    setUpdating(applicationId);
    try {
      const res = await fetch(`/api/jobs/${listingId}/applications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId, status }),
      });
      const json = await res.json();
      if (json.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
        );
      }
    } finally {
      setUpdating(null);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="coaches-empty" style={{ padding: '2rem 0' }}>
        <p>No applications received yet.</p>
      </div>
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Coach</th>
          <th>Certification</th>
          <th>Country</th>
          <th>Email</th>
          <th>Applied</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => {
          const s = STATUS_STYLES[app.status];
          return (
            <tr key={app.id}>
              <td style={{ fontWeight: 600 }}>{app.coach?.full_name ?? '—'}</td>
              <td>
                <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '0.82rem' }}>
                  {app.coach?.certification_level ?? '—'}
                </span>
              </td>
              <td style={{ color: 'var(--muted)' }}>{app.coach?.location_country ?? '—'}</td>
              <td style={{ fontSize: '0.82rem' }}>
                {app.coach?.contact_email
                  ? <a href={`mailto:${app.coach.contact_email}`} style={{ color: 'var(--accent)' }}>{app.coach.contact_email}</a>
                  : '—'}
              </td>
              <td style={{ color: 'var(--muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td>
                <select
                  value={app.status}
                  disabled={updating === app.id}
                  onChange={(e) => handleStatusChange(app.id, e.target.value as JobApplicationStatus)}
                  style={{
                    fontSize: '0.78rem', fontWeight: 700, padding: '4px 8px',
                    borderRadius: 8, border: `1px solid ${s.color}30`,
                    background: s.bg, color: s.color, cursor: 'pointer',
                    opacity: updating === app.id ? 0.6 : 1,
                  }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                  ))}
                </select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
