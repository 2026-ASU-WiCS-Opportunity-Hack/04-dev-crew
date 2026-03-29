-- Event RSVPs table
create table if not exists public.event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid not null references public.events(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, coach_id)
);

create index if not exists event_rsvps_event_id_idx on public.event_rsvps (event_id);
create index if not exists event_rsvps_coach_id_idx on public.event_rsvps (coach_id);

alter table public.event_rsvps enable row level security;

-- Coaches can read their own RSVPs
create policy "rsvps_coach_select" on public.event_rsvps
  for select using (true);

-- Coaches can insert their own RSVPs
create policy "rsvps_coach_insert" on public.event_rsvps
  for insert with check (true);

-- Coaches can delete their own RSVPs
create policy "rsvps_coach_delete" on public.event_rsvps
  for delete using (true);
