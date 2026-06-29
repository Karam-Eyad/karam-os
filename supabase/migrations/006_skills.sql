-- Skills: تعلم المهارات مع مستويات وجلسات
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  icon text not null default '🎯',
  color text not null default '#6366f1',
  created_at timestamptz default now() not null
);

alter table public.skills enable row level security;
create policy "skills: own rows" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- جلسات التعلم
create table if not exists public.skill_sessions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid references public.skills(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  duration_minutes integer not null default 30,
  notes text,
  created_at timestamptz default now() not null
);

alter table public.skill_sessions enable row level security;
create policy "skill_sessions: own rows" on public.skill_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
