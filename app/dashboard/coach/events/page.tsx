export const revalidate = 30;

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCoach } from '@/lib/data/coach';
import EventsList from '@/components/coaches/EventsList';
import type { EventRecord } from '@/lib/types';

const CRAIG_UUID = '56679f4e-9ef6-4c0a-a6e0-73069576c263';

export default async function CoachEventsPage() {
  const coach = await getCoach(CRAIG_UUID);
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
      .eq('coach_id', CRAIG_UUID),
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
        coachId={CRAIG_UUID}
        initialRsvpIds={rsvpIds}
      />
    </>
  );
}
