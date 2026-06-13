-- ============================================================
-- Migration 003 — Agent Portal (parallel account system)
-- Run after 002. Supabase Dashboard → SQL Editor → New Query → Run
--
-- This is a SEPARATE account system from public.users/exporters:
--   profiles  → agent accounts keyed to auth.users
--   status    → 'registered' (quote-wall, instant) | 'pending' (agent
--                applied, awaiting approval) | 'approved' | 'rejected'
--   account_role + parent_id → agency owner vs invited sub-users
-- ============================================================

create type agent_status  as enum ('registered', 'pending', 'approved', 'rejected');
create type account_role  as enum ('owner', 'member');

-- ── profiles ─────────────────────────────────────────────────
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  company_name     text not null default '',
  country          text,
  iata_fiata_code  text,
  volume_tier      text,
  product_types    text[] not null default '{}',
  preferred_routes text[] not null default '{}',
  status           agent_status not null default 'registered',
  account_role     account_role not null default 'owner',
  parent_id        uuid references public.profiles(id) on delete cascade,
  credit_balance_usd numeric(12,2) not null default 0,
  payment_due_date date,
  notify_departure boolean not null default true,
  notify_arrival   boolean not null default true,
  notify_exception boolean not null default true,
  whatsapp_number  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Auto-create a profile row when someone signs up (quote wall / agents form
-- enrich it afterwards via the service role).
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_profile();

-- Resolves the OWNER account id for the current user (owner → self,
-- sub-user → parent). SECURITY DEFINER so policies don't recurse on profiles.
create or replace function public.agent_account_id()
returns uuid language sql security definer stable as $$
  select coalesce(parent_id, id) from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;

create policy "Read own profile and agency members"
  on public.profiles for select
  using (id = auth.uid() or parent_id = auth.uid() or id = public.agent_account_id());

create policy "Insert own profile"
  on public.profiles for insert with check (id = auth.uid());

create policy "Update own profile"
  on public.profiles for update using (id = auth.uid());

create index idx_profiles_parent on public.profiles(parent_id);
create index idx_profiles_status on public.profiles(status);

-- ── agent_bookings ───────────────────────────────────────────
create table public.agent_bookings (
  id            uuid primary key default uuid_generate_v4(),
  account_id    uuid not null references public.profiles(id) on delete cascade,
  created_by    uuid references public.profiles(id) on delete set null,
  flight_number text,
  route         text not null,
  origin        text not null,
  destination   text not null,
  departure_at  timestamptz,
  product_type  text not null default 'General',
  pieces        integer,
  weight_kg     numeric(10,2),
  charges_usd   numeric(12,2),
  status        text not null default 'Booking Requested',
  awb_number    text,
  created_at    timestamptz not null default now()
);

alter table public.agent_bookings enable row level security;

create policy "Agency reads own bookings"
  on public.agent_bookings for select using (account_id = public.agent_account_id());
create policy "Agency inserts own bookings"
  on public.agent_bookings for insert with check (account_id = public.agent_account_id());
create policy "Agency updates own bookings"
  on public.agent_bookings for update using (account_id = public.agent_account_id());

create index idx_agent_bookings_account on public.agent_bookings(account_id);
create index idx_agent_bookings_departure on public.agent_bookings(departure_at desc);

-- ── eawbs (generated air waybills) ───────────────────────────
create table public.eawbs (
  id               uuid primary key default uuid_generate_v4(),
  account_id       uuid not null references public.profiles(id) on delete cascade,
  booking_id       uuid references public.agent_bookings(id) on delete set null,
  awb_number       text not null,
  shipper          jsonb not null default '{}'::jsonb,
  consignee        jsonb not null default '{}'::jsonb,
  commodity        text,
  pieces           integer,
  weight_kg        numeric(10,2),
  dimensions       text,
  special_handling text[] not null default '{}',
  created_at       timestamptz not null default now()
);

alter table public.eawbs enable row level security;

create policy "Agency reads own eawbs"
  on public.eawbs for select using (account_id = public.agent_account_id());
create policy "Agency inserts own eawbs"
  on public.eawbs for insert with check (account_id = public.agent_account_id());

create index idx_eawbs_account on public.eawbs(account_id);

-- ── agent_invoices ───────────────────────────────────────────
create table public.agent_invoices (
  id              uuid primary key default uuid_generate_v4(),
  account_id      uuid not null references public.profiles(id) on delete cascade,
  period_start    date not null,
  period_end      date not null,
  total_shipments integer not null default 0,
  total_weight_kg numeric(12,2) not null default 0,
  total_charges_usd numeric(12,2) not null default 0,
  due_date        date,
  created_at      timestamptz not null default now()
);

alter table public.agent_invoices enable row level security;

create policy "Agency reads own invoices"
  on public.agent_invoices for select using (account_id = public.agent_account_id());

create index idx_agent_invoices_account on public.agent_invoices(account_id);

-- ── agent_notifications ──────────────────────────────────────
create table public.agent_notifications (
  id         uuid primary key default uuid_generate_v4(),
  account_id uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'info',         -- departure | arrival | exception | deal | account | info
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.agent_notifications enable row level security;

create policy "Agency reads own notifications"
  on public.agent_notifications for select using (account_id = public.agent_account_id());
create policy "Agency updates own notifications"
  on public.agent_notifications for update using (account_id = public.agent_account_id());

create index idx_agent_notifications_account on public.agent_notifications(account_id);

-- ── contract_rates (approved agents) ─────────────────────────
create table public.contract_rates (
  id            uuid primary key default uuid_generate_v4(),
  account_id    uuid not null references public.profiles(id) on delete cascade,
  route         text not null,
  product_type  text not null default 'General',
  rate_usd_per_kg numeric(8,2) not null,
  valid_until   date,
  created_at    timestamptz not null default now()
);

alter table public.contract_rates enable row level security;

create policy "Approved agency reads own contract rates"
  on public.contract_rates for select
  using (
    account_id = public.agent_account_id()
    and exists (
      select 1 from public.profiles p
      where p.id = public.agent_account_id() and p.status = 'approved'
    )
  );

create index idx_contract_rates_account on public.contract_rates(account_id);

-- ============================================================
-- Admin operations (approve/reject, seeding bookings/invoices)
-- run through the service role, which bypasses RLS.
-- No fake/demo data is seeded.
-- ============================================================
