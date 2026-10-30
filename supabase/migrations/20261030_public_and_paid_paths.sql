-- Public paths for Explore, paid paths, purchases, and the counts shown on path cards.

alter table public.roadmaps
  add column if not exists cover_url text,
  add column if not exists price numeric(8, 2) check (price is null or price > 0);

create table if not exists public.purchased_roadmaps (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  roadmap_id uuid not null references public.roadmaps (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, roadmap_id)
);

alter table public.purchased_roadmaps enable row level security;

drop policy if exists "Users see their own purchases" on public.purchased_roadmaps;
create policy "Users see their own purchases"
  on public.purchased_roadmaps for select to authenticated
  using (user_id = auth.uid());

-- Checkout is a mock, so a purchase is recorded when the buyer confirms it.
drop policy if exists "Users buy published paths" on public.purchased_roadmaps;
create policy "Users buy published paths"
  on public.purchased_roadmaps for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.roadmaps r where r.id = roadmap_id and r.is_published and r.price is not null)
  );

-- The checks run as the owner so the policies below never trigger each other's policies.
create or replace function public.roadmap_is_public(p_roadmap_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.roadmaps where id = p_roadmap_id and is_published);
$$;

create or replace function public.lesson_is_public(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.roadmap_lessons rl join public.roadmaps r on r.id = rl.roadmap_id
    where rl.lesson_id = p_lesson_id and r.is_published
  );
$$;

-- Step content of a paid path is only readable by its owner and by people who bought it.
create or replace function public.lesson_content_is_readable(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.roadmap_lessons rl join public.roadmaps r on r.id = rl.roadmap_id
    where rl.lesson_id = p_lesson_id
      and r.is_published
      and (
        r.price is null
        or r.owner_id = auth.uid()
        or exists (select 1 from public.purchased_roadmaps p where p.roadmap_id = r.id and p.user_id = auth.uid())
      )
  );
$$;

grant execute on function public.roadmap_is_public(uuid) to anon, authenticated;
grant execute on function public.lesson_is_public(uuid) to anon, authenticated;
grant execute on function public.lesson_content_is_readable(uuid) to anon, authenticated;

-- Anyone can read a public path, its step list, and its author's name.
drop policy if exists "Anyone reads public paths" on public.roadmaps;
create policy "Anyone reads public paths"
  on public.roadmaps for select to anon, authenticated
  using (is_published);

drop policy if exists "Anyone reads steps of public paths" on public.roadmap_lessons;
create policy "Anyone reads steps of public paths"
  on public.roadmap_lessons for select to anon, authenticated
  using (public.roadmap_is_public(roadmap_id));

drop policy if exists "Anyone reads step titles of public paths" on public.lessons;
create policy "Anyone reads step titles of public paths"
  on public.lessons for select to anon, authenticated
  using (public.lesson_is_public(id));

drop policy if exists "Readers see content of public paths" on public.lesson_blocks;
create policy "Readers see content of public paths"
  on public.lesson_blocks for select to anon, authenticated
  using (public.lesson_content_is_readable(lesson_id));

drop policy if exists "Anyone reads author names" on public.profiles;
create policy "Anyone reads author names"
  on public.profiles for select to anon, authenticated
  using (true);

-- Totals for many paths at once. Runs as the owner so it can count rows the caller cannot read.
drop function if exists public.roadmap_stats(uuid);

create or replace function public.path_counts(p_ids uuid[])
returns table (roadmap_id uuid, saves bigint, forks bigint, sales bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    id,
    (select count(*) from public.saved_roadmaps s where s.roadmap_id = ids.id),
    (select count(*) from public.roadmaps r where r.forked_from = ids.id),
    (select count(*) from public.purchased_roadmaps p where p.roadmap_id = ids.id)
  from unnest(p_ids) as ids (id);
$$;

revoke all on function public.path_counts(uuid[]) from public;
grant execute on function public.path_counts(uuid[]) to anon, authenticated;
