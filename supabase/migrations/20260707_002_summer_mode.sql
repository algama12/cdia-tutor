create table if not exists public.summer_mode_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed', 'skipped')),
  level_report jsonb,
  leveling_plan jsonb,
  completed_modules jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.summer_mode_progress enable row level security;

create policy "Users can view own summer progress"
  on public.summer_mode_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own summer progress"
  on public.summer_mode_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own summer progress"
  on public.summer_mode_progress for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_summer_mode_updated_at on public.summer_mode_progress;
create trigger set_summer_mode_updated_at
  before update on public.summer_mode_progress
  for each row execute procedure public.set_updated_at();
