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
    return <img src={photoUrl} alt={name} className="coach-card__avatar" />;
  }

  return (
    <div className="coach-card__avatar coach-card__avatar--initials">
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
    <Link href={`/coaches/${coach.id}`} className="coach-card">
      <div className="coach-card__top">
        <Avatar name={coach.full_name} photoUrl={coach.photo_url} />
        <div className="coach-card__meta">
          <div className="coach-card__name-row">
            <span className="coach-card__name">{coach.full_name}</span>
            <CertBadge level={coach.certification_level} />
            {similarityPct !== null && (
              <span className="coach-card__match">{similarityPct}% match</span>
            )}
          </div>
          <div className="coach-card__location">
            {coach.location_city}, {coach.location_country}
          </div>
          {coach.chapter_name && (
            <div className="coach-card__chapter">{coach.chapter_name}</div>
          )}
        </div>
      </div>

      <p className="coach-card__bio">{excerpt}</p>

      {tags.length > 0 && (
        <div className="coach-card__tags">
          {tags.map((tag) => (
            <span key={tag} className="coach-card__tag">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
