-- Run this once in the Supabase SQL editor to enable genre management
-- (adding/deleting genres, reassigning books on delete).
create table if not exists genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table genres enable row level security;

-- Matches the permissive access already used by "books" and "book_shelves"
-- (public anon key, no auth).
create policy "Allow all on genres" on genres
  for all using (true) with check (true);

-- Seed with the genres already used across the app so existing books keep
-- matching values in the management UI.
insert into genres (name, position)
values
  ('Фантастика', 0),
  ('Фэнтези', 1),
  ('Детектив', 2),
  ('Триллер', 3),
  ('Роман', 4),
  ('Классика', 5),
  ('Нон-фикшн', 6),
  ('Биография', 7),
  ('История', 8),
  ('Поэзия', 9),
  ('Детская', 10),
  ('Другое', 11)
on conflict (name) do nothing;
