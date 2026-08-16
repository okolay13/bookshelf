-- Run this once in the Supabase SQL editor to support the new library filters:
-- favorites, language and publication year.
alter table books add column if not exists is_favorite boolean not null default false;
alter table books add column if not exists language text;
alter table books add column if not exists publication_year int;
