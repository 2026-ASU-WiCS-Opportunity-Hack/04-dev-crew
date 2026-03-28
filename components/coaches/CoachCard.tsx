import Link from 'next/link';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

interface CoachCardProps {
  coach: CoachRecord & { similarity?: number; chapter_name?: string };
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0d5c63, #1a56db)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.1rem',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export default function CoachCard({ coach }: CoachCardProps) {
  const bio = coach.bio_enhanced ?? coach.bio_raw ?? '';
  const excerpt = bio.length > 130 ? bio.slice(0, 130) + '…' : bio;
  const tags = (coach.specializations ?? []).slice(0, 3);
  const similarityPct = coach.similarity ? Math.round(coach.similarity * 100) : null;

  return (
    <Link
      href={`/coaches/${coach.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid rgba(28,43,51,0.08)',
          borderRadius: 16,
          padding: 20,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transition: 'box-shadow 0.15s, transform 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(13,92,99,0.12)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Top row: avatar + name + badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Avatar name={coach.full_name} photoUrl={coach.photo_url} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{coach.full_name}</span>
              <CertBadge level={coach.certification_level} />
              {similarityPct !== null && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#15803d',
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: 999,
                    padding: '1px 8px',
                  }}
                >
                  {similarityPct}% match
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2 }}>
              📍 {coach.location_city}, {coach.location_country}
            </div>
            {coach.chapter_name && (
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 1 }}>
                {coach.chapter_name}
              </div>
            )}
          </div>
        </div>

        {/* Bio excerpt */}
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.55, flex: 1 }}>
          {excerpt}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 9px',
                  borderRadius: 999,
                  background: 'rgba(13,92,99,0.08)',
                  color: 'var(--accent)',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
