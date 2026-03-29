import Link from 'next/link';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

interface CoachProfileProps {
  coach: CoachRecord & { chapter_name?: string };
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="coach-profile-avatar" />;
  }
  return (
    <div className="coach-profile-avatar coach-profile-avatar--initials">
      {initials}
    </div>
  );
}

export default function CoachProfile({ coach }: CoachProfileProps) {
  const bio = coach.bio_enhanced ?? coach.bio_raw ?? 'No bio available.';
  const expiryDate = coach.certification_expiry
    ? new Date(coach.certification_expiry).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div>
      <Link href="/coaches" className="coach-profile-link" style={{ marginBottom: '1.75rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        ← Back to Directory
      </Link>

      <div className="coach-profile-card">
        <div className="coach-profile-header">
          <div className="coach-profile-avatar-wrap">
            <Avatar name={coach.full_name} photoUrl={coach.photo_url} />
          </div>
          <div className="coach-profile-header__info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{coach.full_name}</h2>
              <CertBadge level={coach.certification_level} size="lg" />
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
              📍 {coach.location_city}, {coach.location_country}
              {coach.chapter_name && ` · ${coach.chapter_name}`}
            </p>
          </div>
        </div>

        <div className="coach-profile-body">
          {coach.highlight && (
            <div className="coach-profile-highlight">
              <p style={{ margin: 0, fontStyle: 'italic', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "{coach.highlight}"
              </p>
            </div>
          )}

          <div>
            <h3 style={{ margin: '0 0 0.625rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>About</h3>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>{bio}</p>
          </div>

          {coach.specializations?.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 0.625rem', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Specializations</h3>
              <div className="coach-profile-tags">
                {coach.specializations.map((tag) => (
                  <span key={tag} className="coach-card__tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="coach-info-grid">
            <div className="coach-info-item">
              <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Certification</p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{coach.certification_level}</p>
            </div>
            {expiryDate && (
              <div className="coach-info-item">
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Cert. Expires</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{expiryDate}</p>
              </div>
            )}
            {coach.total_session_hours !== undefined && (
              <div className="coach-info-item">
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Session Hours</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{coach.total_session_hours} hrs</p>
              </div>
            )}
            {coach.total_ce_credits !== undefined && (
              <div className="coach-info-item">
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>CE Credits</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{coach.total_ce_credits} credits</p>
              </div>
            )}
          </div>

          <div className="coach-profile-links">
            {coach.contact_email && (
              <a href={`mailto:${coach.contact_email}`} className="button-primary coach-profile-link">
                ✉️ Contact
              </a>
            )}
            {coach.linkedin_url && (
              <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer" className="button-secondary coach-profile-link">
                💼 LinkedIn
              </a>
            )}
            {coach.website_url && (
              <a href={coach.website_url} target="_blank" rel="noopener noreferrer" className="button-secondary coach-profile-link">
                🌐 Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
