-- Run this once in the Supabase SQL editor to enable per-book notes/quotes
-- as standalone entities (instead of packing them into a single text field
-- on the "books" row). Each row is one note, linked via book_id.
create table if not exists book_notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  title text,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists book_notes_book_id_idx on book_notes(book_id);

alter table book_notes enable row level security;

-- Matches the permissive access already used by "books" and "book_shelves"
-- (public anon key, no auth).
create policy "Allow all on book_notes" on book_notes
  for all using (true) with check (true);

-- Backfill legacy notes packed into books.notes (either a plain string or
-- the JSON array produced by the old inline "Заметки и цитаты" editor).
insert into book_notes (book_id, content, created_at)
select
  b.id,
  coalesce(entry->>'text', b.notes) as content,
  coalesce((entry->>'date')::timestamptz, b.created_at, now()) as created_at
from books b
left join lateral (
  select jsonb_array_elements(b.notes::jsonb) as entry
  where b.notes is not null and left(trim(b.notes), 1) = '['
) parsed on true
where b.notes is not null
  and trim(b.notes) <> ''
  and coalesce(entry->>'text', b.notes) is not null
  and trim(coalesce(entry->>'text', b.notes)) <> '';
