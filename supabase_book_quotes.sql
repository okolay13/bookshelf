-- Run this once in the Supabase SQL editor to enable "Любимые цитаты":
-- a standalone collection of favorite quotes, each linked to a book in the
-- library via book_id. Unlike book_notes, book_id uses ON DELETE SET NULL
-- (not CASCADE) because deleting a book must not silently destroy quotes —
-- the app asks the user to either delete the linked quotes or keep them as
-- standalone entries. fallback_* columns snapshot the book's title/author/
-- cover at the moment it's detached, so a quote that outlives its book still
-- displays sensibly.
create table if not exists book_quotes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete set null,
  quote_text text not null,
  page text,
  personal_note text,
  emoji text,
  created_at timestamptz not null default now(),
  fallback_title text,
  fallback_author text,
  fallback_cover_url text
);

create index if not exists book_quotes_book_id_idx on book_quotes(book_id);

alter table book_quotes enable row level security;

-- Matches the permissive access already used by "books" and "book_notes"
-- (public anon key, no auth).
create policy "Allow all on book_quotes" on book_quotes
  for all using (true) with check (true);
