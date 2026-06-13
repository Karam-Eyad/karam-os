-- Fix: infinite recursion in team_members RLS policy.
-- The old "team members can view members" policy selected from team_members
-- inside its own USING clause, which Postgres evaluates recursively and aborts.
-- This cascaded to teams / tasks / projects / task_comments (all reference
-- team_members), so team data could be written but never read back.
--
-- Solution: SECURITY DEFINER helper functions bypass RLS, so the membership
-- check no longer re-triggers the policy. All team-aware policies are rebuilt
-- on top of these helpers.

-- ---------- Helper functions ----------
create or replace function public.is_team_member(_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = _team_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.teams
    where id = _team_id and owner_id = auth.uid()
  );
$$;

-- ---------- team_members ----------
drop policy if exists "team members can view members" on public.team_members;
drop policy if exists "owner can insert members"      on public.team_members;
drop policy if exists "owner can delete members"       on public.team_members;

create policy "view team members" on public.team_members for select
  using (user_id = auth.uid() or public.is_team_owner(team_id) or public.is_team_member(team_id));

create policy "insert team members" on public.team_members for insert
  with check (user_id = auth.uid() or public.is_team_owner(team_id));

create policy "delete team members" on public.team_members for delete
  using (user_id = auth.uid() or public.is_team_owner(team_id));

-- ---------- teams ----------
drop policy if exists "team members can view team" on public.teams;
create policy "view teams" on public.teams for select
  using (owner_id = auth.uid() or public.is_team_member(id));

-- ---------- team_invites ----------
drop policy if exists "team members can view invites" on public.team_invites;
drop policy if exists "owner can manage invites"       on public.team_invites;
drop policy if exists "anyone can read invite by token" on public.team_invites;

create policy "read invites" on public.team_invites for select using (true);
create policy "manage invites" on public.team_invites for all
  using (public.is_team_owner(team_id))
  with check (public.is_team_owner(team_id));

-- ---------- task_comments ----------
drop policy if exists "team members can view comments" on public.task_comments;
create policy "view comments" on public.task_comments for select
  using (
    user_id = auth.uid() or exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id
        and t.team_id is not null
        and public.is_team_member(t.team_id)
    )
  );

-- ---------- tasks ----------
drop policy if exists "users can view own or team tasks"   on public.tasks;
drop policy if exists "users can insert own or team tasks" on public.tasks;
drop policy if exists "users can update own or team tasks" on public.tasks;
drop policy if exists "users can delete own or team tasks" on public.tasks;

create policy "view tasks" on public.tasks for select
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy "insert tasks" on public.tasks for insert
  with check (user_id = auth.uid() and (team_id is null or public.is_team_member(team_id)));
create policy "update tasks" on public.tasks for update
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy "delete tasks" on public.tasks for delete
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));

-- ---------- projects ----------
drop policy if exists "users can view own or team projects"   on public.projects;
drop policy if exists "users can insert own or team projects" on public.projects;
drop policy if exists "users can update own or team projects" on public.projects;
drop policy if exists "users can delete own or team projects" on public.projects;

create policy "view projects" on public.projects for select
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy "insert projects" on public.projects for insert
  with check (user_id = auth.uid() and (team_id is null or public.is_team_member(team_id)));
create policy "update projects" on public.projects for update
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));
create policy "delete projects" on public.projects for delete
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(team_id)));

-- ---------- profiles (so teammates' names/emails show) ----------
create policy "view teammate profiles" on public.profiles for select
  using (
    id = auth.uid() or exists (
      select 1
      from public.team_members me
      join public.team_members them on them.team_id = me.team_id
      where me.user_id = auth.uid() and them.user_id = profiles.id
    )
  );
