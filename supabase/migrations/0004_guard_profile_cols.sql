-- Stop end users from self-promoting via PATCH /rest/v1/profiles.
-- A BEFORE UPDATE trigger reverts changes to privileged columns when
-- the caller is not an admin (service role bypasses RLS *and* triggers
-- entirely, so server-issued updates are unaffected).

create or replace function public.guard_profile_privileged_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not public.is_admin() then
    new.role := old.role;
    new.plan := old.plan;
    new.monthly_quota := old.monthly_quota;
    new.monthly_used := old.monthly_used;
    new.quota_reset_at := old.quota_reset_at;
  end if;
  return new;
end;
$func$;

drop trigger if exists profile_privileged_cols_guard on public.profiles;
create trigger profile_privileged_cols_guard
  before update on public.profiles
  for each row
  execute function public.guard_profile_privileged_cols();
