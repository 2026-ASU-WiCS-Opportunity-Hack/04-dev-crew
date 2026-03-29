alter table public.global_branding_settings
add column if not exists template_id text not null default 'corporate';

update public.global_branding_settings
set template_id = coalesce(template_id, 'corporate')
where id = 'global';
