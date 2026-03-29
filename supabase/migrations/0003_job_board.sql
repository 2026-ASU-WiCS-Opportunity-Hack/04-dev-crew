-- ─── Job Listings ────────────────────────────────────────────────────────────

create table if not exists public.job_listings (
  id              uuid primary key default gen_random_uuid(),
  chapter_id      uuid references public.chapters(id) on delete cascade,
  organization    text not null,
  title           text not null,
  description     text not null,
  engagement_type text not null check (engagement_type in ('full_time', 'part_time', 'contract', 'project')),
  location        text,
  is_remote       boolean not null default false,
  compensation    text,
  requirements    text,
  apply_deadline  timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_job_listings_active   on public.job_listings (created_at desc) where is_active = true;
create index if not exists idx_job_listings_chapter  on public.job_listings (chapter_id, created_at desc);

alter table public.job_listings enable row level security;

create policy "job_listings_public_select" on public.job_listings
  for select using (is_active = true);

create policy "job_listings_admin_all" on public.job_listings
  for all using (true);

-- ─── Job Applications ─────────────────────────────────────────────────────────

create table if not exists public.job_applications (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.job_listings(id) on delete cascade,
  coach_id    uuid not null references public.coaches(id) on delete cascade,
  cover_note  text,
  status      text not null default 'pending'
              check (status in ('pending', 'reviewed', 'shortlisted', 'declined', 'hired')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(listing_id, coach_id)
);

create index if not exists idx_job_applications_listing on public.job_applications (listing_id, created_at desc);
create index if not exists idx_job_applications_coach   on public.job_applications (coach_id, created_at desc);

alter table public.job_applications enable row level security;

create policy "job_applications_admin_all" on public.job_applications
  for all using (true);
