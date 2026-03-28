import type { CoachRecord } from '@/lib/types';
import CoachCard from './CoachCard';

interface CoachDirectoryProps {
  coaches: (CoachRecord & { similarity?: number; chapter_name?: string })[];
  isSearchResult?: boolean;
}

export default function CoachDirectory({ coaches, isSearchResult }: CoachDirectoryProps) {
  if (coaches.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          color: 'var(--muted)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px' }}>
          No coaches found
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Try a different search query or clear the search to browse all coaches.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '0.85rem' }}>
        {isSearchResult
          ? `${coaches.length} result${coaches.length !== 1 ? 's' : ''} — ranked by semantic similarity`
          : `${coaches.length} certified coach${coaches.length !== 1 ? 'es' : ''} worldwide`}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {coaches.map((coach) => (
          <CoachCard key={coach.id} coach={coach} />
        ))}
      </div>
    </div>
  );
}
