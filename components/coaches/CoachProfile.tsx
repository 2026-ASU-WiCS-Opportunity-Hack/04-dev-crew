import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';
import BackButton from './BackButton';

interface CoachProfileProps {
  coach: CoachRecord & { chapter_name?: string };
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="coach-profile-avatar" />;
  }
  return (
    <div className="coach-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <BackButton label="← Back to Directory" />

      <div className="coach-profile-card">
        {/* Gradient banner */}
        <div className="coach-profile-header" />

        {/* Avatar + name row — overlaps banner via negative margin in CSS */}
        <div className="coach-profile-avatar-wrap">
          <Avatar name={coach.full_name} photoUrl={coach.photo_url} />
          <div style={{ paddingBottom: '0.5rem', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{coach.full_name}</h2>
              <CertBadge level={coach.certification_level} size="lg" />
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
              📍 {coach.location_city}, {coach.location_country}
              {coach.chapter_name && ` · ${coach.chapter_name}`}
            </p>
          </div>
        </div>

        <div className="coach-profile-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {coach.highlight && (
            <div className="coach-profile-highlight">
              "{coach.highlight}"
            </div>
          )}

          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>About</h3>
            <p style={{ margin: 0, lineHeight: 1.75, fontSize: '0.95rem' }}>{bio}</p>
          </div>

          {(coach.specializations ?? []).length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 0.6rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>Specializations</h3>
              <div className="coach-profile-tags">
                {(coach.specializations ?? []).map((tag) => (
                  <span key={tag} className="coach-card__tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="coach-info-grid">
            <div className="coach-info-item">
              <p className="coach-info-item__label">Certification</p>
              <p className="coach-info-item__value">{coach.certification_level}</p>
            </div>
            {expiryDate && (
              <div className="coach-info-item">
                <p className="coach-info-item__label">Cert. Expires</p>
                <p className="coach-info-item__value">{expiryDate}</p>
              </div>
            )}
            {(coach.total_session_hours ?? 0) > 0 && (
              <div className="coach-info-item">
                <p className="coach-info-item__label">Session Hours</p>
                <p className="coach-info-item__value">{coach.total_session_hours} hrs</p>
              </div>
            )}
            {(coach.total_ce_credits ?? 0) > 0 && (
              <div className="coach-info-item">
                <p className="coach-info-item__label">CE Credits</p>
                <p className="coach-info-item__value">{coach.total_ce_credits} credits</p>
              </div>
            )}
          </div>

          <div className="coach-profile-links">
            {coach.contact_email && (
              <a href={`mailto:${coach.contact_email}`} className="button-primary" style={{ fontSize: '0.88rem' }}>
                ✉️ Contact
              </a>
            )}
            {coach.linkedin_url && (
              <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer" className="button-secondary" style={{ fontSize: '0.88rem' }}>
                💼 LinkedIn
              </a>
            )}
            {coach.website_url && (
              <a href={coach.website_url} target="_blank" rel="noopener noreferrer" className="button-secondary" style={{ fontSize: '0.88rem' }}>
                🌐 Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
