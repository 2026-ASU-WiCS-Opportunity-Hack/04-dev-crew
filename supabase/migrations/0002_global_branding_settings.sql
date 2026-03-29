create table if not exists public.global_branding_settings (
  id text primary key default 'global',
  site_name text not null default 'WIAL Global',
  header_cta_label text not null default 'Join WIAL',
  footer_summary text not null default 'The world''s leading authority in Action Learning training and certification.',
  executive_director_email text not null default 'info@wial.org',
  brand_color text not null default '#d10f49',
  brand_dark_color text not null default '#a10f3a',
  accent_color text not null default '#0f8a99',
  footer_background text not null default '#111a2f',
  template_version integer not null default 1,
  updated_at timestamptz default timezone('utc', now()),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.global_branding_settings (
  id,
  site_name,
  header_cta_label,
  footer_summary,
  executive_director_email,
  brand_color,
  brand_dark_color,
  accent_color,
  footer_background,
  template_version
)
values (
  'global',
  'WIAL Global',
  'Join WIAL',
  'The world''s leading authority in Action Learning training and certification.',
  'info@wial.org',
  '#d10f49',
  '#a10f3a',
  '#0f8a99',
  '#111a2f',
  1
)
on conflict (id) do nothing;

alter table public.global_branding_settings enable row level security;

create policy "global_branding_select_public"
on public.global_branding_settings
for select
using (true);

create policy "global_branding_update_super_admin"
on public.global_branding_settings
for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'super_admin'
  )
);
