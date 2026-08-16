-- Run this once in the Supabase SQL editor, after the earlier shelf migrations
-- (supabase_book_shelves.sql, supabase_shelf_upgrades.sql).
-- Adds a display color for user-created shelves and a manual drag order for
-- books within a shelf.

alter table shelves add column if not exists color text;

alter table book_shelves add column if not exists position double precision;

-- Backfill: give existing links a stable order based on when they were linked,
-- so shelves that already have books don't all collapse to the same slot.
with ranked as (
  select id, row_number() over (partition by shelf_name order by created_at) as rn
  from book_shelves
  where position is null
)
update book_shelves set position = ranked.rn
from ranked where book_shelves.id = ranked.id;

create index if not exists book_shelves_shelf_name_position_idx
  on book_shelves(shelf_name, position);
