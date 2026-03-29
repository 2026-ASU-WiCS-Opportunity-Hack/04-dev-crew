alter table public.global_branding_settings
alter column template_id set default 'corporate';

update public.global_branding_settings
set template_id = case
  when template_id = 'templateA' then 'corporate'
  when template_id = 'templateB' then 'startup'
  when template_id = 'templateC' then 'creative'
  when template_id is null then 'corporate'
  else template_id
end
where id = 'global';
