"use client";

import type { EventRecord } from "@/lib/types";
import { EventCard } from "@/components/events/EventCard";

interface EventCalendarProps {
  events: EventRecord[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const sorted = [...events].sort((a, b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  const upcoming = sorted.filter(
    (e) => e.event_date && new Date(e.event_date) >= new Date()
  );
  const past = sorted.filter(
    (e) => e.event_date && new Date(e.event_date) < new Date()
  );

  return (
    <div>
      {upcoming.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h3 className="section-title" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Upcoming Events</h3>
          <div className="card-grid" style={{ gap: "1rem" }}>
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section style={{ opacity: 0.6 }}>
          <h3 className="section-title" style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "var(--muted)" }}>Past Events</h3>
          <div className="card-grid" style={{ gap: "1rem" }}>
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No events yet.</p>
      )}
    </div>
  );
}
