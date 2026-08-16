-- Run this once in the Supabase SQL editor to enable multi-shelf support.
create table if not exists book_shelves (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  shelf_name text not null,
  created_at timestamptz not null default now(),
  unique (book_id, shelf_name)
);

create index if not exists book_shelves_book_id_idx on book_shelves(book_id);
create index if not exists book_shelves_shelf_name_idx on book_shelves(shelf_name);

alter table book_shelves enable row level security;

-- Matches the permissive access already used by the "books" table (public anon key, no auth).
-- If your "books" table has stricter policies, mirror those here instead.
create policy "Allow all on book_shelves" on book_shelves
  for all using (true) with check (true);

-- Backfill existing single-shelf assignments into the new join table.
insert into book_shelves (book_id, shelf_name)
select id, shelf from books
where shelf is not null and trim(shelf) <> ''
on conflict (book_id, shelf_name) do nothing;
