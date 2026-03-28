import Link from 'next/link';
import type { CoachRecord } from '@/lib/types';
import CertBadge from './CertBadge';

interface CoachProfileProps {
  coach: CoachRecord & { chapter_name?: string };
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  if (photoUrl) {
    return <img src={photoUrl} alt={name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />;
  }
  return (
    <div style={{
      width: 120, height: 120, borderRadius: '50%',
      background: 'linear-gradient(135deg, #0d5c63, #1a56db)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: '2rem', flexShrink: 0,
    }}>
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back link */}
      <Link href="/coaches" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 28 }}>
        ← Back to Directory
      </Link>

      {/* Profile card */}
      <div style={{ background: 'var(--card)', border: '1px solid rgba(28,43,51,0.08)', borderRadius: 20, overflow: 'hidden' }}>
        {/* Header band */}
        <div style={{ background: 'linear-gradient(135deg, #0d5c63 0%, #1a56db 100%)', height: 80 }} />

        {/* Avatar overlapping */}
        <div style={{ padding: '0 32px', marginTop: -40 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ border: '4px solid var(--card)', borderRadius: '50%' }}>
              <Avatar name={coach.full_name} photoUrl={coach.photo_url} />
            </div>
            <div style={{ paddingBottom: 8, flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>{coach.full_name}</h1>
                <CertBadge level={coach.certification_level} size="lg" />
              </div>
              <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                📍 {coach.location_city}, {coach.location_country}
                {coach.chapter_name && ` · ${coach.chapter_name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Highlight */}
          {coach.highlight && (
            <div style={{ background: 'rgba(13,92,99,0.06)', borderLeft: '3px solid var(--accent)', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                "{coach.highlight}"
              </p>
            </div>
          )}

          {/* Bio */}
          <div>
            <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>About</h2>
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>{bio}</p>
          </div>

          {/* Specializations */}
          {coach.specializations?.length > 0 && (
            <div>
              <h2 style={{ margin: '0 0 10px', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>Specializations</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {coach.specializations.map((tag) => (
                  <span key={tag} style={{ padding: '4px 14px', borderRadius: 999, background: 'rgba(13,92,99,0.08)', color: 'var(--accent)', fontSize: '0.82rem', fontWeight: 500 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <InfoCard label="Certification" value={coach.certification_level} />
            {expiryDate && <InfoCard label="Cert. Expires" value={expiryDate} />}
            {coach.total_session_hours !== undefined && (
              <InfoCard label="Session Hours Logged" value={`${coach.total_session_hours} hrs`} />
            )}
            {coach.total_ce_credits !== undefined && (
              <InfoCard label="CE Credits" value={`${coach.total_ce_credits} credits`} />
            )}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid rgba(28,43,51,0.08)' }}>
            {coach.contact_email && (
              <a href={`mailto:${coach.contact_email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                ✉️ Contact
              </a>
            )}
            {coach.linkedin_url && (
              <a href={coach.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1.5px solid rgba(28,43,51,0.15)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                💼 LinkedIn
              </a>
            )}
            {coach.website_url && (
              <a href={coach.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1.5px solid rgba(28,43,51,0.15)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                🌐 Website
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 16px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted)' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{value}</p>
    </div>
  );
}
