import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { EventRecord, EventRsvpRecord } from '@/lib/types';

// Hardcoded chapter for demo — replace with real auth session
const DEMO_CHAPTER_ID = null; // null = show all global events

export default async function ChapterEventsPage() {
  const supabase = createSupabaseAdminClient();

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })
    .returns<EventRecord[]>();

  // Fetch RSVPs for all events, joined with coach info
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select('*, coach:coaches(id, full_name, certification_level, location_country)')
    .returns<EventRsvpRecord[]>();

  // Group RSVPs by event_id
  const rsvpsByEvent = (rsvps ?? []).reduce<Record<string, EventRsvpRecord[]>>((acc, r) => {
    if (!acc[r.event_id]) acc[r.event_id] = [];
    acc[r.event_id].push(r);
    return acc;
  }, {});

  const now = new Date();
  const upcoming = (events ?? []).filter((e) => e.event_date && new Date(e.event_date) >= now);
  const past = (events ?? []).filter((e) => e.event_date && new Date(e.event_date) < now);

  function renderEventBlock(event: EventRecord) {
    const attendees = rsvpsByEvent[event.id] ?? [];
    const d = event.event_date ? new Date(event.event_date) : null;

    return (
      <div key={event.id} className="dash-card" style={{ marginBottom: '1.25rem' }}>
        <div className="dash-card__header">
          <div>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: event.is_global ? 'var(--accent)' : 'var(--muted)' }}>
              {event.is_global ? 'Global Event' : 'Chapter Event'}
            </p>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{event.title}</h3>
          </div>
          <span style={{
            fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.8rem',
            borderRadius: 20, background: attendees.length > 0 ? '#dbeafe' : 'var(--surface-muted)',
            color: attendees.length > 0 ? '#1d4ed8' : 'var(--muted)',
          }}>
            {attendees.length} {attendees.length === 1 ? 'RSVP' : 'RSVPs'}
          </span>
        </div>

        <div className="dash-card__body">
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: attendees.length > 0 ? '1.25rem' : 0, fontSize: '0.85rem', color: 'var(--muted)' }}>
            {d && <span>📅 {d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {event.location && <span>📍 {event.location}</span>}
            {event.capacity && <span>👥 Capacity: {event.capacity}</span>}
          </div>

          {attendees.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>No RSVPs yet for this event.</p>
          ) : (
            <table className="data-table" style={{ marginTop: 0 }}>
              <thead>
                <tr>
                  <th>Coach</th>
                  <th>Certification</th>
                  <th>Country</th>
                  <th>RSVP Date</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td style={{ fontWeight: 600 }}>{rsvp.coach?.full_name ?? '—'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '0.82rem' }}>
                        {rsvp.coach?.certification_level ?? '—'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{rsvp.coach?.location_country ?? '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      {new Date(rsvp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Chapter Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Events & RSVPs
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Track attendance and RSVPs for all chapter and global events.
        </p>
      </div>

      {upcoming.length > 0 && (
        <>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Upcoming
          </h2>
          {upcoming.map(renderEventBlock)}
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 style={{ margin: '1.5rem 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Past Events
          </h2>
          {past.slice(0, 5).map(renderEventBlock)}
        </>
      )}

      {(events ?? []).length === 0 && (
        <div className="coaches-empty">
          <p>No events found. Create your first event to get started.</p>
        </div>
      )}
    </>
  );
}
