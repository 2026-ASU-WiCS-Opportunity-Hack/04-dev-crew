"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventRecord, ChapterRecord } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [chapters, setChapters] = useState<ChapterRecord[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const [eventsRes, chaptersRes, rsvpsRes] = await Promise.all([
        supabase.from("events").select("*").order("event_date", { ascending: true }),
        supabase.from("chapters").select("id, name").order("name"),
        supabase.from("event_rsvps").select("event_id"),
      ]);

      const loadedEvents = (eventsRes.data as EventRecord[]) ?? [];
      setEvents(loadedEvents);
      setChapters((chaptersRes.data as ChapterRecord[]) ?? []);

      // Count RSVPs per event
      const counts: Record<string, number> = {};
      for (const rsvp of rsvpsRes.data ?? []) {
        const id = rsvp.event_id as string;
        counts[id] = (counts[id] ?? 0) + 1;
      }
      setRsvpCounts(counts);
      setLoading(false);
    }
    load();
  }, []);

  const now = new Date();
  const upcoming = events.filter((e) => e.event_date && new Date(e.event_date) >= now);
  const past = events.filter((e) => e.event_date && new Date(e.event_date) < now);

  function chapterName(chapterId: string | null) {
    if (!chapterId) return "Global";
    return chapters.find((c) => c.id === chapterId)?.name ?? "—";
  }

  function EventTable({ rows, label }: { rows: EventRecord[]; label: string }) {
    if (rows.length === 0) return null;
    return (
      <section>
        <h3 className="section-title" style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>{label} ({rows.length})</h3>
        <div className="contact-card" style={{ padding: "1.5rem", overflowX: "auto" }}>
          <table style={{ width: "100%", textAlign: "left", fontSize: "0.9rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Title", "Chapter", "Date", "Location", "RSVPs", "Global"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const d = e.event_date ? new Date(e.event_date) : null;
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{e.title}</td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)", fontSize: "0.85rem" }}>{chapterName(e.chapter_id)}</td>
                    <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                      {d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD"}
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem", color: "var(--muted)" }}>{e.location ?? "—"}</td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      <span style={{ fontWeight: 700, color: (rsvpCounts[e.id] ?? 0) > 0 ? "#1a56db" : "var(--muted)" }}>
                        {rsvpCounts[e.id] ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem 0.75rem" }}>
                      {e.is_global && (
                        <span className="badge" style={{ background: "#dbeafe", color: "#1d4ed8" }}>Global</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 className="section-title" style={{ margin: 0 }}>All Events</h1>
      </div>

      {/* Stats */}
      <div className="hero-stats">
        <div className="stat-card"><strong>{events.length}</strong><span>Total Events</span></div>
        <div className="stat-card"><strong>{upcoming.length}</strong><span>Upcoming</span></div>
        <div className="stat-card"><strong>{past.length}</strong><span>Past</span></div>
        <div className="stat-card">
          <strong>{events.filter((e) => e.is_global).length}</strong>
          <span>Global Events</span>
        </div>
        <div className="stat-card">
          <strong>{Object.values(rsvpCounts).reduce((a, b) => a + b, 0)}</strong>
          <span>Total RSVPs</span>
        </div>
      </div>

      {events.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No events yet. Chapter leads can create events from their dashboard.</p>
      ) : (
        <>
          <EventTable rows={upcoming} label="Upcoming Events" />
          <EventTable rows={past} label="Past Events" />
        </>
      )}
    </div>
  );
}
