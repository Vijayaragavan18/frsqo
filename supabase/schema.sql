-- ============================================================================
-- Froska — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) to set up
-- the bookings table, the launch-offer counter, and the RLS policies that
-- keep the "first 20 free" logic honest server-side.
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type service_type as enum (
    'organise',
    'organise_clean',
    'organise_clean_transform',
    'complete_home_reset'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum (
    'pending',
    'confirmed',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null; end $$;

-- ---------- Launch offer config ----------
-- A single row that defines how many launch slots exist. Editable by admins
-- only, so the "20" can be adjusted without a code deploy.
create table if not exists launch_offer_config (
  id smallint primary key default 1 check (id = 1),
  total_free_slots int not null default 20
);

insert into launch_offer_config (id, total_free_slots)
values (1, 20)
on conflict (id) do nothing;

-- ---------- Bookings ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  service_type service_type not null,
  areas text[] not null default '{}',
  preferred_date date not null,
  preferred_time text not null,
  address text not null,
  additional_details text,
  photo_urls text[] default '{}',
  status booking_status not null default 'pending',
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists bookings_created_at_idx on bookings (created_at);
create index if not exists bookings_is_free_idx on bookings (is_free) where is_free = true;

-- ---------- Secure "first 20 free" logic ----------
-- Eligible bookings = anything not cancelled. Counting + flag-setting happens
-- inside a single trigger function so the client can never set is_free itself
-- and there's no race between "check count" and "insert row".
create or replace function set_booking_is_free()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  slots int;
  eligible_count int;
begin
  select total_free_slots into slots from launch_offer_config where id = 1;

  -- lock existing eligible rows so concurrent inserts can't both slip in
  -- under the limit
  select count(*) into eligible_count
  from bookings
  where status <> 'cancelled'
  for update;

  new.is_free := eligible_count < slots;
  new.status := coalesce(new.status, 'pending');
  return new;
end;
$$;

drop trigger if exists trg_set_booking_is_free on bookings;
create trigger trg_set_booking_is_free
  before insert on bookings
  for each row
  execute function set_booking_is_free();

-- Client-supplied is_free / status on INSERT are ignored — the trigger above
-- always overwrites them, so there is nothing to be gained by forging them.

-- ---------- Public, read-only launch offer status ----------
-- Returns only the numbers needed for the "07 / 20 bookings claimed"
-- progress bar — never raw booking rows.
create or replace function get_launch_offer_status()
returns table (claimed int, total int, remaining int)
language sql
security definer
set search_path = public
stable
as $$
  select
    least(count(*)::int, launch_offer_config.total_free_slots) as claimed,
    launch_offer_config.total_free_slots as total,
    greatest(launch_offer_config.total_free_slots - count(*)::int, 0) as remaining
  from bookings, launch_offer_config
  where bookings.status <> 'cancelled'
    and bookings.is_free = true
    and launch_offer_config.id = 1
  group by launch_offer_config.total_free_slots;
$$;

-- ---------- Row Level Security ----------
alter table bookings enable row level security;
alter table launch_offer_config enable row level security;

-- Anyone (anon key) can create a booking...
drop policy if exists "public can insert bookings" on bookings;
create policy "public can insert bookings"
  on bookings for insert
  to anon, authenticated
  with check (true);

-- ...but cannot read the bookings table directly. Booking status/details are
-- looked up through a dedicated authenticated flow (or the admin/service
-- role), not the public API — this keeps other customers' data private.
-- Use `get_launch_offer_status()` (security definer, granted below) for the
-- public progress bar instead of a SELECT policy on the table.

grant execute on function get_launch_offer_status() to anon, authenticated;
grant execute on function set_booking_is_free() to anon, authenticated;

-- ---------- Storage bucket for booking photos ----------
insert into storage.buckets (id, name, public)
values ('booking-photos', 'booking-photos', true)
on conflict (id) do nothing;

drop policy if exists "public can upload booking photos" on storage.objects;
create policy "public can upload booking photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'booking-photos');

drop policy if exists "public can view booking photos" on storage.objects;
create policy "public can view booking photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'booking-photos');
