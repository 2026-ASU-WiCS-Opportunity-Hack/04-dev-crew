import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EventCalendar } from "@/components/events/EventCalendar";
import type { EventRecord } from "@/lib/types";

export const revalidate = 3600;

export default async function PublicEventsPage() {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  const events = (data as EventRecord[]) ?? [];

  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Community</span>
          <h1 className="section-title">Events</h1>
          <p className="section-copy">
            Browse upcoming and past events from WIAL chapters around the world.
          </p>
        </div>
      </section>
      <div className="page-divider" />
      <section className="section">
        <div className="container">
          <EventCalendar events={events} />
        </div>
      </section>
    </>
  );
}
