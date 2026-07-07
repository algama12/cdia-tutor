-- Fix summer_mode_progress FK: reference auth.users instead of profiles,
-- so the row can be inserted as soon as the user registers (before profile exists).
alter table public.summer_mode_progress
  drop constraint summer_mode_progress_user_id_fkey;

alter table public.summer_mode_progress
  add constraint summer_mode_progress_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
