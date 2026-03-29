'use client';

import { useState } from 'react';
import type { JobApplicationRecord, JobApplicationStatus } from '@/lib/types';

const STATUS_STYLES: Record<JobApplicationStatus, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#f3f4f6', color: '#374151', label: 'Pending' },
  reviewed:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Reviewed' },
  shortlisted: { bg: '#ede9fe', color: '#6d28d9', label: 'Shortlisted' },
  declined:    { bg: '#fee2e2', color: '#dc2626', label: 'Declined' },
  hired:       { bg: '#dcfce7', color: '#15803d', label: 'Hired 🎉' },
};

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', project: 'Project',
};

interface MyApplicationsListProps {
  initialApplications: JobApplicationRecord[];
  coachId: string;
}

export default function MyApplicationsList({ initialApplications, coachId }: MyApplicationsListProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);

  async function handleWithdraw(app: JobApplicationRecord) {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    setWithdrawing(app.id);
    try {
      const res = await fetch(`/api/jobs/${app.listing_id}/apply`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coachId }),
      });
      const json = await res.json();
      if (json.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== app.id));
      }
    } finally {
      setWithdrawing(null);
    }
  }

  if (applications.length === 0) {
    return (
      <div className="dash-card">
        <div className="coaches-empty" style={{ padding: '3rem 0' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px' }}>No applications yet</p>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            Browse the <a href="/dashboard/coach/jobs" style={{ color: 'var(--accent)', fontWeight: 600 }}>Job Board</a> and apply to opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-card">
      <div className="dash-card__body" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Organization</th>
              <th>Type</th>
              <th>Applied</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const s = STATUS_STYLES[app.status];
              return (
                <tr key={app.id}>
                  <td style={{ fontWeight: 600 }}>{app.listing?.title ?? '—'}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{app.listing?.organization ?? '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                    {app.listing ? TYPE_LABELS[app.listing.engagement_type] : '—'}
                    {app.listing?.is_remote && <span style={{ marginLeft: 4, color: 'var(--accent)' }}>· Remote</span>}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                  <td>
                    {app.status === 'pending' && (
                      <button
                        onClick={() => handleWithdraw(app)}
                        disabled={withdrawing === app.id}
                        style={{ fontSize: '0.78rem', color: '#dc2626', background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        {withdrawing === app.id ? '…' : 'Withdraw'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
