"use client";

import { useEffect, useState } from "react";

import { EventCalendar } from "@/components/events/EventCalendar";
import { CreateEventForm } from "@/components/events/CreateEventForm";
import { useChapterDashboardContext } from "@/components/providers/ChapterDashboardProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { EventRecord } from "@/lib/types";

export default function ChapterEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("chapter_id", currentChapterId)
      .order("event_date", { ascending: true });
    setEvents((data as EventRecord[]) ?? []);
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
            loadData(chapterId);
          }}
        />
      )}

      <EventCalendar events={events} />
    </div>
  );
}
