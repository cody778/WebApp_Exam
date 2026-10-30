-- Signed-out visitors on Explore need the author name of each public path.
grant select (id, full_name, user_name) on public.profiles to anon;
