create extension if not exists vector;
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  country text not null,
  language text not null default 'en',
  contact_name text,
  contact_email text,
  external_website text,
  content_json jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null check (role in ('super_admin', 'chapter_lead', 'content_creator', 'coach')),
  chapter_id uuid references public.chapters(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  chapter_id uuid references public.chapters(id) on delete set null,
  full_name text not null,
  photo_url text,
  certification_level text not null check (certification_level in ('CALC', 'PALC', 'SALC', 'MALC')),
  certification_date date,
  certification_expiry date,
  bio_raw text,
  bio_enhanced text,
  location_city text,
  location_country text,
  specializations jsonb not null default '[]'::jsonb,
  contact_email text,
  contact_phone text,
  is_approved boolean not null default false,
  embedding vector(1536),
  linkedin_url text,
  website_url text,
  highlight text,
  total_session_hours numeric not null default 0,
  total_ce_credits numeric not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  payer_name text not null,
  payer_email text not null,
  payment_type text not null check (payment_type in ('enrollment', 'certification')),
  student_count integer not null check (student_count > 0),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  paypal_order_id text,
  payment_method text not null default 'stripe' check (payment_method in ('stripe', 'paypal')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue', 'failed')),
  due_date date,
  paid_at timestamptz,
  reminder_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz,
  end_date timestamptz,
  location text,
  registration_link text,
  capacity integer,
  is_global boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  name text not null,
  logo_url text,
  website_url text,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  quote_text text not null,
  author_name text not null,
  author_title text,
  organization text,
  video_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  company_name text not null,
  company_code text unique not null,
  total_licenses integer not null check (total_licenses > 0),
  used_licenses integer not null default 0,
  contact_email text,
  contact_name text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  attendee_name text not null,
  attendee_email text not null,
  status text not null default 'interested' check (status in ('interested', 'registered', 'attended')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.session_logs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  session_date date not null,
  duration_hours numeric not null check (duration_hours > 0),
  client_description text,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ce_credits (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.coaches(id) on delete cascade,
  activity_name text not null,
  credits_earned numeric not null check (credits_earned >= 0),
  completion_date date not null,
  documentation_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references public.chapters(id) on delete cascade,
  subject text not null,
  body_html text not null,
  template_type text not null check (template_type in ('announcement', 'recertification_reminder', 'event_promotion', 'payment_reminder')),
  segment_filter jsonb,
  recipient_count integer not null default 0,
  sent_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'sent', 'failed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists coaches_chapter_id_idx on public.coaches (chapter_id);
create index if not exists coaches_profile_id_idx on public.coaches (profile_id);
create index if not exists coaches_certification_level_idx on public.coaches (certification_level);
create index if not exists coaches_is_approved_idx on public.coaches (is_approved);
create index if not exists payments_chapter_id_idx on public.payments (chapter_id);
create index if not exists events_chapter_id_idx on public.events (chapter_id);
create index if not exists campaigns_chapter_id_idx on public.campaigns (chapter_id);
create index if not exists coach_embedding_idx on public.coaches using ivfflat (embedding vector_cosine_ops) with (lists = 100);

drop trigger if exists chapters_set_updated_at on public.chapters;
create trigger chapters_set_updated_at
before update on public.chapters
for each row execute procedure public.set_updated_at();

drop trigger if exists coaches_set_updated_at on public.coaches;
create trigger coaches_set_updated_at
before update on public.coaches
for each row execute procedure public.set_updated_at();

create or replace function public.match_coaches(
  query_embedding vector(1536),
  match_threshold float default 0.3,
  match_count int default 10
)
returns table (
  id uuid,
  profile_id uuid,
  chapter_id uuid,
  full_name text,
  photo_url text,
  certification_level text,
  certification_date date,
  certification_expiry date,
  bio_raw text,
  bio_enhanced text,
  location_city text,
  location_country text,
  specializations jsonb,
  contact_email text,
  contact_phone text,
  is_approved boolean,
  linkedin_url text,
  website_url text,
  highlight text,
  total_session_hours numeric,
  total_ce_credits numeric,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.profile_id,
    c.chapter_id,
    c.full_name,
    c.photo_url,
    c.certification_level,
    c.certification_date,
    c.certification_expiry,
    c.bio_raw,
    c.bio_enhanced,
    c.location_city,
    c.location_country,
    c.specializations,
    c.contact_email,
    c.contact_phone,
    c.is_approved,
    c.linkedin_url,
    c.website_url,
    c.highlight,
    c.total_session_hours,
    c.total_ce_credits,
    c.created_at,
    c.updated_at,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.coaches c
  where c.is_approved = true
    and c.embedding is not null
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

alter table public.chapters enable row level security;
alter table public.profiles enable row level security;
alter table public.coaches enable row level security;
alter table public.payments enable row level security;
alter table public.events enable row level security;
alter table public.clients enable row level security;
alter table public.testimonials enable row level security;
alter table public.enrollments enable row level security;
alter table public.rsvps enable row level security;
alter table public.session_logs enable row level security;
alter table public.ce_credits enable row level security;
alter table public.campaigns enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_chapter_id()
returns uuid
language sql
stable
as $$
  select chapter_id from public.profiles where id = auth.uid();
$$;

drop policy if exists "chapters_public_select" on public.chapters;
drop policy if exists "chapters_admin_write" on public.chapters;
drop policy if exists "chapters_insert_admin" on public.chapters;
drop policy if exists "chapters_update_own" on public.chapters;
drop policy if exists "profiles_self_select" on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;
drop policy if exists "coaches_public_select" on public.coaches;
drop policy if exists "coaches_insert" on public.coaches;
drop policy if exists "coaches_update" on public.coaches;
drop policy if exists "payments_restricted_access" on public.payments;
drop policy if exists "events_public_select" on public.events;
drop policy if exists "events_write" on public.events;
drop policy if exists "clients_public_select" on public.clients;
drop policy if exists "clients_write" on public.clients;
drop policy if exists "testimonials_public_select" on public.testimonials;
drop policy if exists "testimonials_write" on public.testimonials;
drop policy if exists "enrollments_public_select" on public.enrollments;
drop policy if exists "enrollments_write" on public.enrollments;
drop policy if exists "rsvps_public_insert" on public.rsvps;
drop policy if exists "rsvps_admin_select" on public.rsvps;
drop policy if exists "session_logs_self_access" on public.session_logs;
drop policy if exists "ce_credits_self_access" on public.ce_credits;
drop policy if exists "campaigns_write" on public.campaigns;
drop policy if exists "campaigns_access" on public.campaigns;

create policy "chapters_public_select" on public.chapters
for select
using (is_active = true);

create policy "chapters_insert_admin" on public.chapters
for insert
with check (public.current_role() = 'super_admin');

create policy "chapters_update_own" on public.chapters
for update
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and id = public.current_chapter_id()
  )
);

create policy "profiles_self_select" on public.profiles
for select
using (
  id = auth.uid()
  or public.current_role() = 'super_admin'
);

create policy "profiles_self_update" on public.profiles
for update
using (
  id = auth.uid()
  or public.current_role() = 'super_admin'
)
with check (
  id = auth.uid()
  or public.current_role() = 'super_admin'
);

create policy "profiles_self_insert" on public.profiles
for insert
with check (
  id = auth.uid()
  or public.current_role() = 'super_admin'
);

create policy "coaches_public_select" on public.coaches
for select
using (
  is_approved = true
  or public.current_role() = 'super_admin'
  or profile_id = auth.uid()
);

create policy "coaches_insert" on public.coaches
for insert
with check (
  auth.uid() is not null
);

create policy "coaches_update" on public.coaches
for update
using (
  public.current_role() = 'super_admin'
  or profile_id = auth.uid()
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or profile_id = auth.uid()
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);

create policy "payments_restricted_access" on public.payments
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);

create policy "events_public_select" on public.events
for select
using (true);

create policy "events_write" on public.events
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() in ('chapter_lead', 'content_creator')
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() in ('chapter_lead', 'content_creator')
    and chapter_id = public.current_chapter_id()
  )
);

create policy "clients_public_select" on public.clients
for select
using (true);

create policy "clients_write" on public.clients
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);

create policy "testimonials_public_select" on public.testimonials
for select
using (true);

create policy "testimonials_write" on public.testimonials
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);

create policy "enrollments_public_select" on public.enrollments
for select
using (true);

create policy "enrollments_write" on public.enrollments
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);

create policy "rsvps_public_insert" on public.rsvps
for insert
with check (true);

create policy "rsvps_admin_select" on public.rsvps
for select
using (
  public.current_role() = 'super_admin'
  or exists (
    select 1
    from public.events e
    where e.id = event_id
      and e.chapter_id = public.current_chapter_id()
      and public.current_role() = 'chapter_lead'
  )
);

create policy "session_logs_self_access" on public.session_logs
for all
using (
  public.current_role() = 'super_admin'
  or exists (
    select 1
    from public.coaches c
    where c.id = coach_id
      and c.profile_id = auth.uid()
  )
)
with check (
  public.current_role() = 'super_admin'
  or exists (
    select 1
    from public.coaches c
    where c.id = coach_id
      and c.profile_id = auth.uid()
  )
);

create policy "ce_credits_self_access" on public.ce_credits
for all
using (
  public.current_role() = 'super_admin'
  or exists (
    select 1
    from public.coaches c
    where c.id = coach_id
      and c.profile_id = auth.uid()
  )
)
with check (
  public.current_role() = 'super_admin'
  or exists (
    select 1
    from public.coaches c
    where c.id = coach_id
      and c.profile_id = auth.uid()
  )
);

create policy "campaigns_access" on public.campaigns
for all
using (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
)
with check (
  public.current_role() = 'super_admin'
  or (
    public.current_role() = 'chapter_lead'
    and chapter_id = public.current_chapter_id()
  )
);
