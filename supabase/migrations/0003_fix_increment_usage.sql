-- Fix increment_usage RPC: previous OUT parameter names (monthly_used,
-- monthly_quota) collided with column names on public.profiles,
-- producing "column reference 'monthly_used' is ambiguous" inside the
-- UPDATE. Rename OUT params to (used, quota) and fully qualify the
-- column references in the UPDATE/RETURNING clauses.

drop function if exists public.increment_usage(uuid);

create or replace function public.increment_usage(p_user_id uuid)
returns table (used int, quota int)
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_used int;
  v_quota int;
begin
  update public.profiles
     set monthly_used = public.profiles.monthly_used + 1
   where id = p_user_id
   returning public.profiles.monthly_used, public.profiles.monthly_quota
   into v_used, v_quota;
  return query select v_used, v_quota;
end;
$func$;
