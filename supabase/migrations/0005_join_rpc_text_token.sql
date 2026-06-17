-- Correct the join_team_by_token signature: team_invites.token is `text`,
-- not `uuid`, so the previous uuid-typed version couldn't match any row.

drop function if exists public.join_team_by_token(uuid);

create or replace function public.join_team_by_token(_token text)
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

  select ti.team_id into v_team_id
  from public.team_invites ti
  where ti.token = _token
  limit 1;

  if v_team_id is null then
    return query select null::uuid, 'invalid_token'::text;
    return;
  end if;

  select exists(
    select 1 from public.team_members
    where team_id = v_team_id and user_id = v_uid
  ) into v_already_member;

  if v_already_member then
    return query select v_team_id, 'already_member'::text;
    return;
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_uid, 'editor');

  return query select v_team_id, 'joined'::text;
end;
$$;

grant execute on function public.join_team_by_token(text) to authenticated;
