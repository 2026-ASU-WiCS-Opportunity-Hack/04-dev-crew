alter table public.global_branding_settings
add column if not exists logo_url text,
add column if not exists primary_nav_json jsonb not null default '[
  {"href":"/certification","label":"Certification"},
  {"href":"/coaches","label":"Find a Coach"},
  {"href":"/events","label":"Programs"},
  {"href":"/resources","label":"Resources"},
  {"href":"/about","label":"About"},
  {"href":"/contact","label":"Contact"}
]'::jsonb;

update public.global_branding_settings
set
  logo_url = coalesce(logo_url, null),
  primary_nav_json = coalesce(
    primary_nav_json,
    '[
      {"href":"/certification","label":"Certification"},
      {"href":"/coaches","label":"Find a Coach"},
      {"href":"/events","label":"Programs"},
      {"href":"/resources","label":"Resources"},
      {"href":"/about","label":"About"},
      {"href":"/contact","label":"Contact"}
    ]'::jsonb
  )
where id = 'global';
