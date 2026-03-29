"use client";

import { useEffect, useState } from "react";

import { EventCalendar } from "@/components/events/EventCalendar";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventRecord, EventRsvpRecord } from "@/lib/types";

export default function ChapterEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [rsvpsByEvent, setRsvpsByEvent] = useState<Record<string, EventRsvpRecord[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const { chapterId } = useChapterDashboardContext();

  useEffect(() => {
    if (!chapterId) {
      setLoading(false);
      return;
    }
    loadData(chapterId);
  }, [chapterId]);

  async function loadData(currentChapterId: string) {
    const supabase = createSupabaseBrowserClient();

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("chapter_id", currentChapterId)
      .order("event_date", { ascending: true });

    const loadedEvents = (eventsData as EventRecord[]) ?? [];
    setEvents(loadedEvents);

    // Fetch RSVPs scoped to this chapter's events
    if (loadedEvents.length > 0) {
      const eventIds = loadedEvents.map((e) => e.id);
      const { data: rsvps } = await supabase
        .from("event_rsvps")
        .select("*, coach:coaches(id, full_name, certification_level, location_country)")
        .in("event_id", eventIds);

      const grouped = ((rsvps ?? []) as EventRsvpRecord[]).reduce<Record<string, EventRsvpRecord[]>>(
        (acc, r) => {
          if (!acc[r.event_id]) acc[r.event_id] = [];
          acc[r.event_id].push(r);
          return acc;
        },
        {}
      );
      setRsvpsByEvent(grouped);
    }

    setLoading(false);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

  const upcomingEvents = events.filter((e) => e.event_date && new Date(e.event_date) >= new Date());

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title">Events</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="button-primary"
        >
          {showForm ? "Cancel" : "New Event"}
        </button>
      </div>

      {showForm && (
        <CreateEventForm
          chapterId={chapterId}
          onCreated={() => {
            setShowForm(false);
            loadData(chapterId);
          }}
        />
      )}

      <EventCalendar events={events} />

      {/* RSVP Attendance Panel */}
      {upcomingEvents.length > 0 && (
        <div className="dash-card">
          <div className="dash-card__header">
            <h2 className="dash-card__title">Event RSVPs</h2>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
              {Object.values(rsvpsByEvent).reduce((sum, r) => sum + r.length, 0)} total RSVPs
            </span>
          </div>
          <div className="dash-card__body" style={{ padding: 0 }}>
            {upcomingEvents.map((event) => {
              const attendees = rsvpsByEvent[event.id] ?? [];
              const isExpanded = expandedEvent === event.id;
              const d = event.event_date ? new Date(event.event_date) : null;

              return (
                <div key={event.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  {/* Event row */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", padding: "0.9rem 1.35rem",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "left", gap: "1rem",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 0.15rem", fontWeight: 700, fontSize: "0.9rem" }}>
                        {event.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted)" }}>
                        {d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date TBD"}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                      <span style={{
                        fontSize: "0.75rem", fontWeight: 700, padding: "3px 10px",
                        borderRadius: 20,
                        background: attendees.length > 0 ? "#dbeafe" : "var(--surface-muted)",
                        color: attendees.length > 0 ? "#1d4ed8" : "var(--muted)",
                      }}>
                        {attendees.length} {attendees.length === 1 ? "RSVP" : "RSVPs"}
                      </span>
                      <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded attendee list */}
                  {isExpanded && (
                    <div style={{ padding: "0 1.35rem 1rem" }}>
                      {attendees.length === 0 ? (
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", fontStyle: "italic" }}>
                          No RSVPs yet for this event.
                        </p>
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
                                <td style={{ fontWeight: 600 }}>{rsvp.coach?.full_name ?? "—"}</td>
                                <td>
                                  <span style={{ fontWeight: 700, color: "var(--brand)", fontSize: "0.82rem" }}>
                                    {rsvp.coach?.certification_level ?? "—"}
                                  </span>
                                </td>
                                <td style={{ color: "var(--muted)" }}>{rsvp.coach?.location_country ?? "—"}</td>
                                <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                                  {new Date(rsvp.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
