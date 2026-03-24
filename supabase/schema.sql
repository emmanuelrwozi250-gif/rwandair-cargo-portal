-- ============================================================
-- RwandAir Cargo Portal — Supabase Database Schema
-- Paste this entire file into:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type user_role        as enum ('exporter', 'admin');
create type exporter_status  as enum ('pending', 'approved', 'rejected');
create type export_category  as enum ('Coffee', 'Produce', 'Processed', 'Other');
create type transport_mode   as enum ('air', 'water');
create type water_type       as enum ('inland_lake', 'ocean', 'coastal');
create type lake_name        as enum ('Victoria', 'Tanganyika', 'Malawi', 'Other');
create type container_type   as enum ('20ft', '40ft', '40ft HC', 'LCL', 'Bulk', 'N/A');
create type destination_type as enum ('airport_cargo', 'lake_port', 'ocean_port');
create type incoterm_type    as enum ('EXW', 'FOB', 'CIF', 'DAP', 'DDP', 'Other');
create type pickup_status    as enum (
  'Requested', 'Transporter Assigned', 'En Route to Pickup',
  'Cargo Collected', 'En Route to Terminal', 'Delivered to Terminal', 'Cancelled'
);
create type shipment_status  as enum (
  'Draft', 'Documents Pending', 'Booking Requested', 'Space Confirmed',
  'In Transit', 'Port In', 'Vessel Departed', 'Port of Discharge',
  'Delivered', 'Closed'
);
create type document_type as enum (
  'Commercial Invoice', 'Packing List', 'Phytosanitary Certificate',
  'Export License', 'Bill of Lading', 'Inland Waterway Bill',
  'Certificate of Origin', 'Cargo Manifest', 'Vessel Booking Confirmation',
  'Port Health Certificate', 'Other'
);

-- ── Shared helper: set updated_at ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── Helper: current user role ────────────────────────────────
create or replace function get_user_role()
returns text as $$
  select role::text from public.users where id = auth.uid()
$$ language sql security definer stable;

-- ── users ────────────────────────────────────────────────────
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  role       user_role not null default 'exporter',
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select using (id = auth.uid() or get_user_role() = 'admin');

create policy "Users can update own profile"
  on public.users for update using (id = auth.uid());

-- Auto-create users row when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── exporters ────────────────────────────────────────────────
create table public.exporters (
  id                           uuid primary key default uuid_generate_v4(),
  user_id                      uuid not null references public.users(id) on delete cascade,
  company_name                 text not null,
  business_registration_number text,
  export_license_number        text,
  contact_person               text not null,
  email                        text not null,
  phone                        text not null,
  export_category              export_category not null default 'Other',
  primary_export_destination   text,
  status                       exporter_status not null default 'pending',
  created_at                   timestamptz not null default now()
);

alter table public.exporters enable row level security;

create policy "Exporters can read own profile"
  on public.exporters for select
  using (user_id = auth.uid() or get_user_role() = 'admin');

create policy "Exporters can insert own profile"
  on public.exporters for insert with check (user_id = auth.uid());

create policy "Exporters can update own profile"
  on public.exporters for update
  using (user_id = auth.uid() or get_user_role() = 'admin');

create index idx_exporters_user_id on public.exporters(user_id);
create index idx_exporters_status  on public.exporters(status);

-- ── transporters ─────────────────────────────────────────────
create table public.transporters (
  id             uuid primary key default uuid_generate_v4(),
  company_name   text not null,
  contact_person text not null,
  phone          text not null,
  email          text,
  city           text not null,
  country        text not null default 'Rwanda',
  vehicle_types  text[],
  max_weight_kg  numeric,
  is_active      boolean not null default true,
  rating         numeric not null default 0,
  total_pickups  integer not null default 0,
  on_time_rate   numeric not null default 0,
  admin_notes    text,
  created_at     timestamptz not null default now()
);

alter table public.transporters enable row level security;

create policy "Admins full access transporters"
  on public.transporters for all
  using (get_user_role() = 'admin');

create policy "Authenticated users can read active transporters"
  on public.transporters for select
  using (is_active = true and auth.uid() is not null);

-- ── water_ports ──────────────────────────────────────────────
create table public.water_ports (
  id          uuid primary key default uuid_generate_v4(),
  port_name   text not null,
  port_type   text not null check (port_type in ('lake', 'ocean', 'coastal')),
  lake_or_sea text,
  country     text not null,
  is_active   boolean not null default true
);

alter table public.water_ports enable row level security;

create policy "Anyone can read active ports"
  on public.water_ports for select using (is_active = true);

create policy "Admins full access water_ports"
  on public.water_ports for all using (get_user_role() = 'admin');

insert into public.water_ports (port_name, port_type, lake_or_sea, country) values
  ('Kisumu Port',     'lake',  'Victoria',     'Kenya'),
  ('Mwanza Port',     'lake',  'Victoria',     'Tanzania'),
  ('Entebbe Port',    'lake',  'Victoria',     'Uganda'),
  ('Kigoma Port',     'lake',  'Tanganyika',   'Tanzania'),
  ('Bujumbura Port',  'lake',  'Tanganyika',   'Burundi'),
  ('Monkey Bay',      'lake',  'Malawi',       'Malawi'),
  ('Mombasa Port',    'ocean', 'Indian Ocean', 'Kenya'),
  ('Dar es Salaam',   'ocean', 'Indian Ocean', 'Tanzania');

-- ── shipments ────────────────────────────────────────────────
create sequence shipment_seq start 1;

create table public.shipments (
  id                       uuid primary key default uuid_generate_v4(),
  shipment_id              text unique not null default '',
  exporter_id              uuid not null references public.exporters(id) on delete restrict,
  product_type             text not null,
  quantity                 integer not null,
  weight_kg                numeric(10,2) not null,
  destination_country      text not null,
  destination_airport      text,
  preferred_departure_date date,
  buyer_name               text,
  invoice_value_usd        numeric(12,2),
  incoterm                 incoterm_type,
  status                   shipment_status not null default 'Draft',
  transport_mode           transport_mode not null default 'air',
  -- water-specific fields
  water_type               water_type,
  vessel_name              text,
  voyage_number            text,
  port_of_loading          text,
  port_of_discharge        text,
  lake_name                lake_name,
  vessel_operator          text,
  port_cutoff_date         date,
  bill_of_lading_number    text,
  container_number         text,
  container_type           container_type,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Auto-generate shipment_id: RWB-2026-00001
create or replace function generate_shipment_id()
returns trigger language plpgsql as $$
begin
  if new.shipment_id = '' or new.shipment_id is null then
    new.shipment_id := 'RWB-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('shipment_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger set_shipment_id
  before insert on public.shipments
  for each row execute function generate_shipment_id();

create trigger shipments_updated_at
  before update on public.shipments
  for each row execute procedure public.set_updated_at();

alter table public.shipments enable row level security;

create policy "Exporters can read own shipments"
  on public.shipments for select using (
    exporter_id in (select id from public.exporters where user_id = auth.uid())
    or get_user_role() = 'admin'
  );

create policy "Exporters can insert own shipments"
  on public.shipments for insert with check (
    exporter_id in (select id from public.exporters where user_id = auth.uid() and status = 'approved')
  );

create policy "Exporters can update own draft shipments"
  on public.shipments for update using (
    (exporter_id in (select id from public.exporters where user_id = auth.uid()) and status = 'Draft')
    or get_user_role() = 'admin'
  );

create index idx_shipments_exporter_id on public.shipments(exporter_id);
create index idx_shipments_status      on public.shipments(status);
create index idx_shipments_created_at  on public.shipments(created_at desc);

-- ── status_logs ──────────────────────────────────────────────
create table public.status_logs (
  id              uuid primary key default uuid_generate_v4(),
  shipment_id     uuid not null references public.shipments(id) on delete cascade,
  previous_status shipment_status,
  new_status      shipment_status not null,
  changed_by      uuid not null references public.users(id),
  note            text,
  changed_at      timestamptz not null default now()
);

alter table public.status_logs enable row level security;

create policy "Exporters can read own status logs"
  on public.status_logs for select using (
    shipment_id in (
      select s.id from public.shipments s
      join public.exporters e on s.exporter_id = e.id
      where e.user_id = auth.uid()
    ) or get_user_role() = 'admin'
  );

create policy "Authenticated users can insert status logs"
  on public.status_logs for insert with check (auth.uid() is not null);

create index idx_status_logs_shipment_id on public.status_logs(shipment_id);

-- ── pickup_requests ───────────────────────────────────────────
create sequence pickup_seq start 1;

create table public.pickup_requests (
  id                      uuid primary key default uuid_generate_v4(),
  pickup_id               text unique not null default '',
  shipment_id             uuid not null references public.shipments(id) on delete restrict,
  exporter_id             uuid not null references public.exporters(id) on delete restrict,
  pickup_address          text not null,
  pickup_city             text not null,
  pickup_country          text not null,
  pickup_contact_name     text not null,
  pickup_contact_phone    text not null,
  destination_terminal    text not null,
  destination_type        destination_type not null default 'airport_cargo',
  cargo_description       text,
  number_of_pieces        integer,
  total_weight_kg         numeric,
  required_pickup_date    date not null,
  required_pickup_time_by time,
  cargo_cutoff_time       timestamptz,
  special_handling_notes  text,
  transporter_id          uuid references public.transporters(id),
  status                  pickup_status not null default 'Requested',
  estimated_pickup_time   timestamptz,
  actual_pickup_time      timestamptz,
  actual_delivery_time    timestamptz,
  admin_notes             text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create or replace function generate_pickup_id()
returns trigger language plpgsql as $$
begin
  if new.pickup_id = '' or new.pickup_id is null then
    new.pickup_id := 'PKP-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('pickup_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger set_pickup_id
  before insert on public.pickup_requests
  for each row execute function generate_pickup_id();

create trigger pickup_requests_updated_at
  before update on public.pickup_requests
  for each row execute procedure public.set_updated_at();

alter table public.pickup_requests enable row level security;

create policy "Exporters can read own pickups"
  on public.pickup_requests for select using (
    exporter_id in (select id from public.exporters where user_id = auth.uid())
    or get_user_role() = 'admin'
  );

create policy "Exporters can insert own pickups"
  on public.pickup_requests for insert with check (
    exporter_id in (select id from public.exporters where user_id = auth.uid())
  );

create policy "Admins can update pickups"
  on public.pickup_requests for update using (get_user_role() = 'admin');

-- ── documents ────────────────────────────────────────────────
create table public.documents (
  id            uuid primary key default uuid_generate_v4(),
  shipment_id   uuid not null references public.shipments(id) on delete cascade,
  document_type document_type not null,
  file_url      text not null,
  file_name     text not null,
  uploaded_at   timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Exporters can read own documents"
  on public.documents for select using (
    shipment_id in (
      select s.id from public.shipments s
      join public.exporters e on s.exporter_id = e.id
      where e.user_id = auth.uid()
    ) or get_user_role() = 'admin'
  );

create policy "Exporters can insert own documents"
  on public.documents for insert with check (
    shipment_id in (
      select s.id from public.shipments s
      join public.exporters e on s.exporter_id = e.id
      where e.user_id = auth.uid()
    )
  );

create policy "Admins can insert any document"
  on public.documents for insert with check (get_user_role() = 'admin');

create index idx_documents_shipment_id on public.documents(shipment_id);

-- ── notifications ────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update using (user_id = auth.uid());

create policy "Authenticated users can insert notifications"
  on public.notifications for insert with check (auth.uid() is not null);

create index idx_notifications_user_id on public.notifications(user_id);

-- ── Storage bucket ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('shipment-documents', 'shipment-documents', false)
on conflict do nothing;

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'shipment-documents' and auth.uid() is not null);

create policy "Authenticated users can read"
  on storage.objects for select
  using (bucket_id = 'shipment-documents' and auth.uid() is not null);

create policy "Admins can delete"
  on storage.objects for delete
  using (bucket_id = 'shipment-documents' and get_user_role() = 'admin');

-- ============================================================
-- AFTER RUNNING: promote your admin account
--
--   update public.users set role = 'admin'
--   where email = 'cargo@rwandair.com';
--
-- ============================================================
