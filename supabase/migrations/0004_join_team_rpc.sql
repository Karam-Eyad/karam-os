-- Atomic, RLS-safe team-join flow.
--
-- Previously the /join/[token] page tried to:
--   1) read team_invites (depends on RLS allowing the joinee to see invites),
--   2) check existing team_members membership,
--   3) insert a new team_members row.
--
-- Even with the public-read policy on team_invites, the INSERT into
-- team_members could fail silently or trigger 500s when policies were
-- mid-migration. This RPC does everything atomically with elevated rights,
-- removes the chicken-and-egg problem, and returns a clear error code.

create or replace function public.join_team_by_token(_token uuid)
returns table (team_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_team_id uuid;
  v_already_member boolean;
begin
  if v_uid is null then
    return query select null::uuid, 'unauthorized'::text;
    return;
  end if;

  -- Find invite by token (bypasses RLS because of SECURITY DEFINER)
  select ti.team_id into v_team_id
  from public.team_invites ti
  where ti.token = _token
  limit 1;

  if v_team_id is null then
    return query select null::uuid, 'invalid_token'::text;
    return;
  end if;

  -- Already a member?
  select exists(
    select 1 from public.team_members
    where team_id = v_team_id and user_id = v_uid
  ) into v_already_member;

  if v_already_member then
    return query select v_team_id, 'already_member'::text;
    return;
  end if;

  -- Insert as editor
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_uid, 'editor');

  return query select v_team_id, 'joined'::text;
end;
$$;

-- Allow any authenticated user to call it (the function itself checks auth.uid)
grant execute on function public.join_team_by_token(uuid) to authenticated;
