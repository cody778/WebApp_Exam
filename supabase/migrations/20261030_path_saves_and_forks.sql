-- Saved paths and forks, so a path can show how many times it was saved and forked.

create table if not exists public.saved_roadmaps (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, roadmap_id)
);

alter table public.saved_roadmaps enable row level security;

create policy "Users see their own saved paths"
  on public.saved_roadmaps for select to authenticated
  using (user_id = auth.uid());

create policy "Users save paths"
  on public.saved_roadmaps for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users unsave paths"
  on public.saved_roadmaps for delete to authenticated
  using (user_id = auth.uid());

alter table public.roadmaps
  add column if not exists forked_from uuid references public.roadmaps (id) on delete set null;

-- Counts across every user. Runs as the owner so it can count rows the caller cannot read, and returns only totals.
create or replace function public.roadmap_stats(p_roadmap_id uuid)
returns table (saves bigint, forks bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.saved_roadmaps where roadmap_id = p_roadmap_id),
    (select count(*) from public.roadmaps where forked_from = p_roadmap_id);
$$;

revoke all on function public.roadmap_stats(uuid) from public;
grant execute on function public.roadmap_stats(uuid) to authenticated;
