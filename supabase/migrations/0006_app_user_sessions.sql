create table if not exists public.app_user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('super_admin', 'chapter_lead', 'content_creator', 'coach')),
  session_token_hash text not null unique,
  user_agent text,
  ip_address text,
  last_active_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists app_user_sessions_user_id_idx
  on public.app_user_sessions (user_id, created_at desc);

alter table public.app_user_sessions enable row level security;

drop policy if exists "app_user_sessions_self_select" on public.app_user_sessions;
drop policy if exists "app_user_sessions_self_update" on public.app_user_sessions;

create policy "app_user_sessions_self_select" on public.app_user_sessions
for select
using (user_id = auth.uid());

create policy "app_user_sessions_self_update" on public.app_user_sessions
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
