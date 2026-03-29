'use client';

import { useState } from 'react';
import type { EventRecord } from '@/lib/types';

interface RsvpModalProps {
  event: EventRecord;
  coachId: string;
  onClose: () => void;
  onSuccess: (eventId: string) => void;
}

export default function RsvpModal({ event, coachId, onClose, onSuccess }: RsvpModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : null;
  const eventTime = event.event_date
    ? new Date(event.event_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;
  const endDate = event.end_date
    ? new Date(event.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coach_id: coachId }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      onSuccess(event.id);
      onClose();
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 999, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000, width: '100%', maxWidth: 520,
        background: 'var(--surface)', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        padding: '2rem', margin: '0 1rem',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Event RSVP
          </p>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {event.title}
          </h2>
        </div>

        {/* Event details */}
        <div style={{ background: 'var(--surface-muted)', borderRadius: 10, padding: '1rem 1.1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          {eventDate && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>📅</span>
              <span>{eventDate}{eventTime ? ` at ${eventTime}` : ''}{endDate ? ` – ${endDate}` : ''}</span>
            </div>
          )}
          {event.location && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>📍</span>
              <span>{event.location}</span>
            </div>
          )}
          {event.capacity && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>👥</span>
              <span>Capacity: {event.capacity} attendees</span>
            </div>
          )}
          {event.is_global && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--muted)', minWidth: 20 }}>🌐</span>
              <span>Global WIAL Event</span>
            </div>
          )}
        </div>

        {event.description && (
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            {event.description}
          </p>
        )}

        {/* Confirmation message */}
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
          By confirming your RSVP, you are indicating your intent to attend this event. Your chapter lead will be notified of your participation.
        </p>

        {error && (
          <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#dc2626', background: '#fee2e2', padding: '0.6rem 0.9rem', borderRadius: 8 }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="button-secondary"
            style={{ fontSize: '0.88rem' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="button-primary"
            style={{ fontSize: '0.88rem', minWidth: 120 }}
          >
            {loading ? 'Confirming…' : 'Confirm RSVP'}
          </button>
        </div>
      </div>
    </>
  );
}
