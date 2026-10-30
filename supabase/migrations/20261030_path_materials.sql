-- Materials listed on a path, in the order the author added them.

alter table public.roadmaps
  add column if not exists materials text[] not null default '{}';
