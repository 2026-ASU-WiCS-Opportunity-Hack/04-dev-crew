"use client";

import type { EventRecord } from "@/lib/types";
import { RsvpButton } from "@/components/rsvps/RsvpButton";

interface EventCardProps {
  event: EventRecord;
  showRsvp?: boolean;
}

export function EventCard({ event, showRsvp }: EventCardProps) {
  return (
    <div className="feature-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <strong>{event.title}</strong>
          {event.event_date && (
            <p style={{ marginTop: "0.25rem", color: "var(--muted)", fontSize: "0.9rem" }}>
              {new Date(event.event_date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {event.end_date && (
                <> &ndash; {new Date(event.end_date).toLocaleDateString("en-US")}</>
              )}
            </p>
          )}
          {event.location && (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{event.location}</p>
          )}
        </div>
        {event.is_global && (
          <span className="badge">Global</span>
        )}
      </div>

      {event.description && (
        <p style={{ marginTop: "0.7rem", color: "var(--muted)", lineHeight: 1.7 }}>{event.description}</p>
      )}

      <div style={{ marginTop: "0.7rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {event.capacity && (
          <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Capacity: {event.capacity}</span>
        )}
        {event.registration_link && (
          <a
            href={event.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="home-link"
            style={{ marginTop: 0, fontSize: "0.8rem" }}
          >
            Register &rarr;
          </a>
        )}
      </div>

      {showRsvp && (
        <div style={{ marginTop: "0.75rem" }}>
          <RsvpButton eventId={event.id} />
        </div>
      )}
    </div>
  );
}
