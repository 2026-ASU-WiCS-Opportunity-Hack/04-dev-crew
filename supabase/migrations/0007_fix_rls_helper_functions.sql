-- Fix recursive RLS: current_role() and current_chapter_id() query the profiles
-- table, but profiles has RLS policies that call these same functions, causing
-- infinite recursion (Postgres error 54001: stack depth limit exceeded).
-- Adding SECURITY DEFINER makes these functions run as the function owner
-- (bypassing RLS), breaking the recursion.

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_chapter_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select chapter_id from public.profiles where id = auth.uid();
$$;
