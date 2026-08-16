-- Run this once in the Supabase SQL editor, after supabase_book_shelves.sql.
-- Adds default/protected shelves ("Все книги", "Хочу прочитать") and
-- "smart" shelves that are dynamic filters (by genre / by book thickness /
-- by status) instead of manual book_shelves membership.

alter table shelves
  add column if not exists kind text not null default 'manual' check (kind in ('manual', 'smart')),
  add column if not exists filter_type text,
  add column if not exists filter_value text,
  add column if not exists is_default boolean not null default false,
  add column if not exists is_all boolean not null default false;

alter table shelves drop constraint if exists shelves_filter_type_check;
alter table shelves add constraint shelves_filter_type_check
  check (filter_type in ('genre', 'thickness', 'status'));

-- "Все книги" is virtual: it always shows every book and never holds real
-- book_shelves rows. It's just a renameable, undeletable tab pinned first.
insert into shelves (name, position, kind, is_default, is_all)
select 'Все книги', coalesce((select min(position) from shelves), 0) - 2, 'manual', true, true
where not exists (select 1 from shelves where is_all = true);

-- "Хочу прочитать" is a smart shelf: it auto-collects every book whose
-- status is still the default "to_read", so books never need to be
-- manually dropped onto it. If it already exists as a manual shelf
-- (created by the old single-shelf flow), convert it in place.
update shelves
set kind = 'smart', filter_type = 'status', filter_value = 'to_read', is_default = true
where name = 'Хочу прочитать' and is_all = false;

insert into shelves (name, position, kind, filter_type, filter_value, is_default)
select 'Хочу прочитать', coalesce((select min(position) from shelves), 0) - 1, 'smart', 'status', 'to_read', true
where not exists (select 1 from shelves where is_default = true and is_all = false);
