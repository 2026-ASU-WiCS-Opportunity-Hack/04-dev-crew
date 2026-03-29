'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CertBadge from '@/components/coaches/CertBadge';
import type { CoachRecord } from '@/lib/types';

type CoachWithChapter = CoachRecord & { chapters?: { name: string } | null };

export default function AdminApprovalPage() {
  const [pending, setPending] = useState<CoachWithChapter[]>([]);
  const [approved, setApproved] = useState<CoachWithChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/coaches');
      const json = await res.json();
      if (json.ok) {
        setPending((json.data as CoachWithChapter[]).filter((c) => !c.is_approved));
        setApproved((json.data as CoachWithChapter[]).filter((c) => c.is_approved));
      }
      setLoading(false);
    }
    load();
  }, []);

  async function setApproval(coachId: string, approve: boolean) {
    setActing(coachId);
    const res = await fetch(`/api/coaches/${coachId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: approve }),
    });
    const json = await res.json();
    if (json.ok) {
      if (approve) {
        setPending((prev) => {
          const coach = prev.find((c) => c.id === coachId)!;
          setApproved((a) => [{ ...coach, is_approved: true }, ...a]);
          return prev.filter((c) => c.id !== coachId);
        });
      } else {
        setApproved((prev) => {
          const coach = prev.find((c) => c.id === coachId)!;
          setPending((p) => [{ ...coach, is_approved: false }, ...p]);
          return prev.filter((c) => c.id !== coachId);
        });
      }
    }
    setActing(null);
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dash-heading">Coach Approvals</h1>
        <p className="dash-subtext">
          Review pending coach profiles. Approved coaches appear in the public directory and semantic search.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Loading coaches…</div>
      ) : (
        <>
          {/* Pending section */}
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Pending Review</h2>
              {pending.length > 0 && (
                <span style={{
                  background: 'var(--brand)', color: '#fff',
                  borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                  padding: '2px 9px',
                }}>
                  {pending.length}
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="form-section" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', padding: '2rem' }}>
                ✓ No coaches pending review.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {pending.map((coach) => (
                  <CoachRow
                    key={coach.id}
                    coach={coach}
                    acting={acting === coach.id}
                    onApprove={() => setApproval(coach.id, true)}
                    onRevoke={null}
                    isPending
                  />
                ))}
              </div>
            )}
          </section>

          {/* Approved section */}
          <section>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>
              Approved & Published
              <span style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: 400, color: 'var(--muted)' }}>
                ({approved.length})
              </span>
            </h2>

            {approved.length === 0 ? (
              <div className="form-section" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem', padding: '2rem' }}>
                No approved coaches yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {approved.map((coach) => (
                  <CoachRow
                    key={coach.id}
                    coach={coach}
                    acting={acting === coach.id}
                    onApprove={null}
                    onRevoke={() => setApproval(coach.id, false)}
                    isPending={false}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

interface CoachRowProps {
  coach: CoachWithChapter;
  acting: boolean;
  onApprove: (() => void) | null;
  onRevoke: (() => void) | null;
  isPending: boolean;
}

function CoachRow({ coach, acting, onApprove, onRevoke, isPending }: CoachRowProps) {
  const initials = coach.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="form-section" style={{
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      borderLeft: isPending ? '3px solid var(--brand)' : '3px solid #15803d',
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--accent), var(--brand))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {coach.photo_url
          ? <img src={coach.photo_url} alt={coach.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{initials}</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{coach.full_name}</span>
          <CertBadge level={coach.certification_level} size="sm" />
        </div>
        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
          {[coach.location_city, coach.location_country].filter(Boolean).join(', ')}
          {coach.chapters?.name && ` · ${coach.chapters.name}`}
          {coach.contact_email && ` · ${coach.contact_email}`}
        </p>
      </div>

      {/* Joined date */}
      {coach.created_at && (
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', flexShrink: 0 }}>
          Joined {new Date(coach.created_at).toLocaleDateString()}
        </span>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Link
          href={`/coaches/${coach.id}`}
          target="_blank"
          style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--foreground)' }}
        >
          View Profile
        </Link>

        {onApprove && (
          <button
            onClick={onApprove}
            disabled={acting}
            style={{
              padding: '6px 16px', borderRadius: 7, border: 'none',
              background: acting ? 'var(--muted)' : '#15803d',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: acting ? 'not-allowed' : 'pointer',
            }}
          >
            {acting ? 'Approving…' : '✓ Approve'}
          </button>
        )}

        {onRevoke && (
          <button
            onClick={onRevoke}
            disabled={acting}
            style={{
              padding: '6px 14px', borderRadius: 7,
              border: '1px solid rgba(220,38,38,0.3)', background: 'transparent',
              color: '#dc2626', fontWeight: 600, fontSize: '0.82rem',
              cursor: acting ? 'not-allowed' : 'pointer',
            }}
          >
            {acting ? '…' : 'Revoke'}
          </button>
        )}
      </div>
    </div>
  );
}
