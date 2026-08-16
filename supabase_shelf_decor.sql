-- Run this once in the Supabase SQL editor.
-- Lets users freely scatter decorative items (plants, candles, etc.) between
-- books on any shelf. Each row is one placed item; there is no limit on how
-- many of a given decor_type can be placed.
create table if not exists shelf_decor (
  id uuid primary key default gen_random_uuid(),
  shelf_name text not null,
  decor_type text not null,
  slot double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists shelf_decor_shelf_name_idx on shelf_decor(shelf_name);

alter table shelf_decor enable row level security;

-- Matches the permissive access already used by "books" and "book_shelves"
-- (public anon key, no auth). If those tables have stricter policies in your
-- project, mirror those here instead.
create policy "Allow all on shelf_decor" on shelf_decor
  for all using (true) with check (true);
