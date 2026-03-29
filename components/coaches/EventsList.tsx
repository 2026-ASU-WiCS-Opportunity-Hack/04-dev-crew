'use client';

import { useState } from 'react';
import type { EventRecord } from '@/lib/types';
import RsvpModal from './RsvpModal';

interface EventsListProps {
  upcoming: EventRecord[];
  past: EventRecord[];
  coachId: string;
  initialRsvpIds: string[]; // event IDs the coach has already RSVPd to
}

export default function EventsList({ upcoming, past, coachId, initialRsvpIds }: EventsListProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set(initialRsvpIds));

  function handleRsvpSuccess(eventId: string) {
    setRsvpIds((prev) => new Set([...prev, eventId]));
  }

  function renderEvent(event: EventRecord, isPast = false) {
    const d = event.event_date ? new Date(event.event_date) : null;
    const hasRsvpd = rsvpIds.has(event.id);

    return (
      <div key={event.id} className="dash-event-item" style={isPast ? { opacity: 0.6 } : {}}>
        {d && (
          <div className="dash-event-date" style={isPast ? { background: 'rgba(37,56,74,0.06)', color: 'var(--muted)' } : {}}>
            <span className="dash-event-date__day">{d.getDate()}</span>
            <span className="dash-event-date__month">{d.toLocaleString('en-US', { month: 'short' })}</span>
          </div>
        )}
        <div className="dash-event-info">
          <p className="dash-event-info__title">
            {event.title}
            {event.is_global && <span className="dash-event-global">Global</span>}
          </p>
          <p className="dash-event-info__meta">
            {event.location && `📍 ${event.location}`}
            {event.location && event.end_date && ' · '}
            {event.end_date && `Ends ${new Date(event.end_date).toLocaleDateString()}`}
          </p>
          {event.description && (
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              {event.description.slice(0, 120)}{event.description.length > 120 ? '…' : ''}
            </p>
          )}
        </div>

        {!isPast && (
          hasRsvpd ? (
            <span
              style={{
                fontSize: '0.78rem', whiteSpace: 'nowrap', alignSelf: 'center',
                padding: '0.4rem 0.85rem', borderRadius: 8, fontWeight: 700,
                background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0',
              }}
            >
              ✓ RSVPd
            </span>
          ) : (
            <button
              onClick={() => setSelectedEvent(event)}
              className="button-primary"
              style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', alignSelf: 'center', padding: '0.4rem 0.85rem' }}
            >
              RSVP
            </button>
          )
        )}
      </div>
    );
  }

  return (
    <>
      {/* Upcoming */}
      <div className="dash-card" style={{ marginBottom: '1.5rem' }}>
        <div className="dash-card__header">
          <h2 className="dash-card__title">Upcoming Events</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="coaches-empty" style={{ padding: '2.5rem 0' }}>
            <p>No upcoming events found. Check back soon.</p>
          </div>
        ) : (
          <div>{upcoming.map((e) => renderEvent(e, false))}</div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="dash-card">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Past Events</h2>
          </div>
          <div>{past.slice(0, 5).map((e) => renderEvent(e, true))}</div>
        </div>
      )}

      {/* RSVP Modal */}
      {selectedEvent && (
        <RsvpModal
          event={selectedEvent}
          coachId={coachId}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleRsvpSuccess}
        />
      )}
    </>
  );
}
