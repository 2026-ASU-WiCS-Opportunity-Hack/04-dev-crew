'use client';

import { useState } from 'react';
import type { JobListingRecord } from '@/lib/types';
import JobListingCard from './JobListingCard';
import ApplyModal from './ApplyModal';

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'project', label: 'Project' },
];

interface JobListingsBoardProps {
  listings: JobListingRecord[];
  coachId: string;
  initialAppliedIds: string[];
}

export default function JobListingsBoard({ listings, coachId, initialAppliedIds }: JobListingsBoardProps) {
  const [appliedIds, setAppliedIds] = useState(new Set(initialAppliedIds));
  const [selected, setSelected] = useState<JobListingRecord | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const filtered = listings.filter((l) => {
    if (typeFilter && l.engagement_type !== typeFilter) return false;
    if (remoteOnly && !l.is_remote) return false;
    return true;
  });

  function handleSuccess(listingId: string) {
    setAppliedIds((prev) => new Set([...prev, listingId]));
  }

  return (
    <>
      {/* Filters */}
      <div className="coaches-filters" style={{ marginBottom: '1.5rem' }}>
        <select className="coaches-filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
          <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
          Remote only
        </label>
        {(typeFilter || remoteOnly) && (
          <button className="button-secondary" onClick={() => { setTypeFilter(''); setRemoteOnly(false); }} style={{ fontSize: '0.85rem' }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Count */}
      <p className="search-info" style={{ marginBottom: '1rem' }}>
        {filtered.length} opportunit{filtered.length !== 1 ? 'ies' : 'y'} available
      </p>

      {/* Listings */}
      {filtered.length === 0 ? (
        <div className="coaches-empty">
          <p>No job listings match your filters. Try adjusting or clearing them.</p>
        </div>
      ) : (
        filtered.map((listing) => {
          const hasApplied = appliedIds.has(listing.id);
          return (
            <JobListingCard
              key={listing.id}
              listing={listing}
              action={
                hasApplied ? (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.9rem', borderRadius: 8, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                    ✓ Applied
                  </span>
                ) : (
                  <button
                    onClick={() => setSelected(listing)}
                    className="button-primary"
                    style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    Apply Now
                  </button>
                )
              }
            />
          );
        })
      )}

      {selected && (
        <ApplyModal
          listing={selected}
          coachId={coachId}
          onClose={() => setSelected(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
