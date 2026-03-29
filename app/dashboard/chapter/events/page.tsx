"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { EventCalendar } from "@/components/events/EventCalendar";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import type { EventRecord } from "@/lib/types";

export default function ChapterEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("chapter_id")
      .eq("id", user.id)
      .single();

    const cid = (profile as { chapter_id: string | null } | null)?.chapter_id ?? null;
    setChapterId(cid);

    if (cid) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("chapter_id", cid)
        .order("event_date", { ascending: true });
      setEvents((data as EventRecord[]) ?? []);
    }
    setLoading(false);
  }

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading...</p>;
  if (!chapterId) return <p style={{ color: "#dc2626", fontSize: "0.9rem" }}>No chapter assigned.</p>;

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
            loadData();
          }}
        />
      )}

      <EventCalendar events={events} />
    </div>
  );
}
