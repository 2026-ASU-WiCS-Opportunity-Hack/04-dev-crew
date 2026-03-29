export const revalidate = 30;

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireCoach } from '@/lib/auth/server';
import EventsList from '@/components/coaches/EventsList';
import type { EventRecord } from '@/lib/types';

export default async function CoachEventsPage() {
  const { coach } = await requireCoach();
  const supabase = createSupabaseAdminClient();

  const [{ data: events }, { data: rsvps }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .or(coach?.chapter_id
        ? `is_global.eq.true,chapter_id.eq.${coach.chapter_id}`
        : 'is_global.eq.true')
      .order('event_date', { ascending: true })
      .returns<EventRecord[]>(),
    supabase
      .from('event_rsvps')
      .select('event_id')
      .eq('coach_id', coach.id),
  ]);

  const now = new Date();
  const upcoming = (events ?? []).filter((e) => e.event_date && new Date(e.event_date) >= now);
  const past = (events ?? []).filter((e) => e.event_date && new Date(e.event_date) < now);
  const rsvpIds = (rsvps ?? []).map((r) => r.event_id as string);

  return (
    <>
      <div style={{ marginBottom: '1.75rem' }}>
        <span className="eyebrow">Coach Dashboard</span>
        <h1 style={{ margin: '0.75rem 0 0.4rem', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Events
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
          Upcoming WIAL events — global and from your chapter.
        </p>
      </div>

      <EventsList
        upcoming={upcoming}
        past={past}
        coachId={coach.id}
        initialRsvpIds={rsvpIds}
      />
    </>
  );
}
