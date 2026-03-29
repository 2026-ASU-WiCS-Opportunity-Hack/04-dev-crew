import type { JobListingRecord } from '@/lib/types';

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  project: 'Project',
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  full_time:  { bg: '#dbeafe', color: '#1d4ed8' },
  part_time:  { bg: '#ede9fe', color: '#6d28d9' },
  contract:   { bg: '#fef3c7', color: '#b45309' },
  project:    { bg: '#dcfce7', color: '#15803d' },
};

interface JobListingCardProps {
  listing: JobListingRecord;
  action?: React.ReactNode;
}

export default function JobListingCard({ listing, action }: JobListingCardProps) {
  const typeStyle = TYPE_COLORS[listing.engagement_type] ?? { bg: 'var(--surface-muted)', color: 'var(--muted)' };
  const deadline = listing.apply_deadline
    ? new Date(listing.apply_deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;
  const isPastDeadline = listing.apply_deadline ? new Date(listing.apply_deadline) < new Date() : false;

  return (
    <div className="dash-card" style={{ marginBottom: '1rem' }}>
      <div className="dash-card__body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{listing.title}</h3>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...typeStyle }}>
              {TYPE_LABELS[listing.engagement_type]}
            </span>
            {!listing.is_active && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280' }}>
                Closed
              </span>
            )}
          </div>

          {/* Org */}
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)' }}>
            {listing.organization}
            {listing.chapter?.name && <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {listing.chapter.name}</span>}
          </p>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.6rem' }}>
            <span>📍 {listing.is_remote ? 'Remote' : (listing.location ?? 'Location TBD')}</span>
            {listing.compensation && <span>💰 {listing.compensation}</span>}
            {deadline && (
              <span style={{ color: isPastDeadline ? '#dc2626' : 'inherit' }}>
                ⏰ {isPastDeadline ? 'Deadline passed' : `Apply by ${deadline}`}
              </span>
            )}
          </div>

          {/* Description excerpt */}
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>
            {listing.description.length > 160 ? listing.description.slice(0, 160) + '…' : listing.description}
          </p>
        </div>

        {/* Action slot */}
        {action && (
          <div style={{ flexShrink: 0, alignSelf: 'center' }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
