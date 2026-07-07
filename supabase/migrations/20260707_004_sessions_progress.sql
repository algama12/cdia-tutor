-- Sessions table
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  topic_id text not null,
  mode text not null check (mode in ('explain', 'exercise', 'review')),
  created_at timestamptz default now() not null,
  ended_at timestamptz
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update using (auth.uid() = user_id);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own sessions"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = messages.session_id and s.user_id = auth.uid()
    )
  );

-- Topic progress table
create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject_id text not null,
  topic_id text not null,
  exercises_attempted int not null default 0,
  exercises_correct int not null default 0,
  last_seen_at timestamptz default now() not null,
  unique(user_id, subject_id, topic_id)
);

alter table public.topic_progress enable row level security;

create policy "Users can view own topic progress"
  on public.topic_progress for select using (auth.uid() = user_id);

create policy "Users can insert own topic progress"
  on public.topic_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own topic progress"
  on public.topic_progress for update using (auth.uid() = user_id);
