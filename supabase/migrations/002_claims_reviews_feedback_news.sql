-- ============================================================
-- Migration 002 — Claims, Ratings & Reviews, Feedback, News
-- Run after schema.sql + 001:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- ── Enums ───────────────────────────────────────────────────
create type claim_type   as enum ('Loss', 'Damage', 'Delay', 'Shortage', 'Pilferage');
create type claim_status as enum ('Received', 'Under Review', 'Resolved', 'Rejected');
create type claim_relationship as enum ('shipper', 'consignee', 'agent');
create type contact_method     as enum ('email', 'whatsapp', 'phone');
create type feedback_category  as enum (
  'Booking & Pricing', 'Operations & Handling', 'Tracking & Communication',
  'Website & Digital Tools', 'New Route / Destination Request', 'Other'
);
create type article_category as enum (
  'Route News', 'Service Alerts', 'Trade Intelligence', 'Company News', 'Compliance Updates'
);
create type review_cargo_type as enum ('Perishables', 'Pharma', 'General', 'Courier');

-- ── claims ───────────────────────────────────────────────────
create sequence claim_seq start 1;

create table public.claims (
  id                 uuid primary key default uuid_generate_v4(),
  claim_ref          text unique not null default '',
  claim_type         claim_type not null,
  status             claim_status not null default 'Received',
  awb                text not null,
  flight_number      text,
  origin             text,
  destination        text,
  delivery_date      date,
  declared_value_usd numeric(12,2),
  description        text not null,
  claim_value_usd    numeric(12,2),
  file_urls          jsonb not null default '[]'::jsonb,
  good_condition_confirmed boolean not null default false,
  claimant_name      text not null,
  claimant_company   text,
  claimant_email     text not null,
  claimant_phone     text not null,
  relationship       claim_relationship not null,
  preferred_contact  contact_method not null default 'email',
  time_limit_warning text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Auto-generate claim_ref: WB-CLM-YYYYMMDD-0001
create or replace function generate_claim_ref()
returns trigger language plpgsql as $$
begin
  if new.claim_ref = '' or new.claim_ref is null then
    new.claim_ref := 'WB-CLM-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('claim_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

create trigger set_claim_ref
  before insert on public.claims
  for each row execute function generate_claim_ref();

create trigger claims_updated_at
  before update on public.claims
  for each row execute procedure public.set_updated_at();

alter table public.claims enable row level security;

create policy "Admins full access claims"
  on public.claims for all using (get_user_role() = 'admin');
-- Public submissions and lookups go through the API (service role).

create index idx_claims_ref        on public.claims(claim_ref);
create index idx_claims_created_at on public.claims(created_at desc);

-- ── claim_events (status timeline) ──────────────────────────
create table public.claim_events (
  id         uuid primary key default uuid_generate_v4(),
  claim_id   uuid not null references public.claims(id) on delete cascade,
  status     claim_status not null,
  note       text,
  created_at timestamptz not null default now()
);

alter table public.claim_events enable row level security;

create policy "Admins full access claim_events"
  on public.claim_events for all using (get_user_role() = 'admin');

create index idx_claim_events_claim_id on public.claim_events(claim_id);

-- ── rating_requests (token-gated invitations) ────────────────
create table public.rating_requests (
  id            uuid primary key default uuid_generate_v4(),
  awb           text not null,
  route         text,
  delivery_date date,
  email         text not null,
  token_hash    text not null unique,
  expires_at    timestamptz not null,
  used_at       timestamptz,
  sent_at       timestamptz not null default now()
);

alter table public.rating_requests enable row level security;

create policy "Admins full access rating_requests"
  on public.rating_requests for all using (get_user_role() = 'admin');

create index idx_rating_requests_awb on public.rating_requests(awb);

-- ── ratings ──────────────────────────────────────────────────
create table public.ratings (
  id                  uuid primary key default uuid_generate_v4(),
  request_id          uuid references public.rating_requests(id) on delete set null,
  awb                 text not null,
  route               text,
  cargo_type          review_cargo_type not null default 'General',
  score_booking       smallint not null check (score_booking between 1 and 5),
  score_ontime        smallint not null check (score_ontime between 1 and 5),
  score_condition     smallint not null check (score_condition between 1 and 5),
  score_communication smallint not null check (score_communication between 1 and 5),
  score_overall       smallint not null check (score_overall between 1 and 5),
  comment             text,
  display_consent     boolean not null default false,
  full_name_consent   boolean not null default false,
  reviewer_name       text,
  reviewer_company    text,
  is_published        boolean not null default true,
  is_flagged          boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "Anyone can read published consented ratings"
  on public.ratings for select
  using (is_published = true and display_consent = true);

create policy "Admins full access ratings"
  on public.ratings for all using (get_user_role() = 'admin');

create index idx_ratings_created_at on public.ratings(created_at desc);
create index idx_ratings_cargo_type on public.ratings(cargo_type);

-- ── nps_responses ────────────────────────────────────────────
create table public.nps_responses (
  id         uuid primary key default uuid_generate_v4(),
  score      smallint not null check (score between 0 and 10),
  reason     text,
  source     text not null default 'page',           -- 'page' | 'drawer'
  created_at timestamptz not null default now()
);

alter table public.nps_responses enable row level security;

create policy "Admins full access nps_responses"
  on public.nps_responses for all using (get_user_role() = 'admin');

-- ── feedback ─────────────────────────────────────────────────
create table public.feedback (
  id         uuid primary key default uuid_generate_v4(),
  category   feedback_category not null,
  message    text not null,
  urgent     boolean not null default false,
  name       text,
  email      text,
  awb_ref    text,
  status     text not null default 'new',             -- new | reviewed | actioned
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Admins full access feedback"
  on public.feedback for all using (get_user_role() = 'admin');

create index idx_feedback_created_at on public.feedback(created_at desc);

-- ── feature_requests (public read-only board, curated) ───────
create table public.feature_requests (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  request_count integer not null default 1,
  is_visible    boolean not null default true,
  sort_order    integer not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.feature_requests enable row level security;

create policy "Anyone can read visible feature requests"
  on public.feature_requests for select using (is_visible = true);

create policy "Admins full access feature_requests"
  on public.feature_requests for all using (get_user_role() = 'admin');

-- ── articles (News & Updates hub) ────────────────────────────
create table public.articles (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  category        article_category not null,
  published_at    timestamptz not null default now(),
  author_name     text not null default 'RwandAir Cargo Desk',
  author_role     text not null default 'Cargo Communications',
  hero_image_url  text,
  hero_image_alt  text,
  summary         text not null check (char_length(summary) <= 160),
  body            text not null,                       -- markdown
  tags            text[] not null default '{}',
  is_service_alert boolean not null default false,
  related_routes  text[] not null default '{}',
  is_published    boolean not null default true,
  useful_yes      integer not null default 0,
  useful_no       integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger articles_updated_at
  before update on public.articles
  for each row execute procedure public.set_updated_at();

alter table public.articles enable row level security;

create policy "Anyone can read published articles"
  on public.articles for select using (is_published = true);

create policy "Admins full access articles"
  on public.articles for all using (get_user_role() = 'admin');

create index idx_articles_slug         on public.articles(slug);
create index idx_articles_category     on public.articles(category);
create index idx_articles_published_at on public.articles(published_at desc);

-- ── news_subscribers ─────────────────────────────────────────
create table public.news_subscribers (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null unique,
  categories text[] not null default '{}',
  format     text not null default 'digest',           -- digest | instant
  created_at timestamptz not null default now()
);

alter table public.news_subscribers enable row level security;

create policy "Admins full access news_subscribers"
  on public.news_subscribers for all using (get_user_role() = 'admin');

-- ── agent_enquiries (formalises the table /api/agents/enquiry writes) ──
create table if not exists public.agent_enquiries (
  id             uuid primary key default uuid_generate_v4(),
  company_name   text not null,
  iata_code      text,
  contact_name   text not null,
  email          text not null,
  phone          text not null,
  country        text not null,
  monthly_volume text,
  primary_routes text[] not null default '{}',
  hear_about     text,
  status         text not null default 'new',
  submitted_at   timestamptz not null default now()
);

alter table public.agent_enquiries enable row level security;

create policy "Admins full access agent_enquiries"
  on public.agent_enquiries for all using (get_user_role() = 'admin');

-- ── Storage bucket for claim documents (private) ─────────────
insert into storage.buckets (id, name, public)
values ('claim-documents', 'claim-documents', false)
on conflict do nothing;
-- Uploads/reads happen server-side with the service role; no anon policies.

-- ── Seed: feature request board ──────────────────────────────
insert into public.feature_requests (title, request_count, sort_order) values
  ('Direct KGL → CDG freighter service',                       47, 1),
  ('Saturday cut-off extension for perishables (22:00)',        31, 2),
  ('API webhook for status changes (cargo.one parity)',         26, 3),
  ('Mombasa road-feeder service integration',                   19, 4),
  ('RWF invoicing option for Rwandan exporters',                14, 5);

-- ── Seed: launch articles (one per priority category) ────────
insert into public.articles (slug, title, category, published_at, author_name, author_role, hero_image_url, hero_image_alt, summary, body, tags, related_routes) values
(
  'rwandair-cargo-portal-launch',
  'RwandAir Cargo launches its new digital portal — claims, reviews, and live updates in one place',
  'Company News',
  now() - interval '1 day',
  'RwandAir Cargo Desk',
  'Cargo Communications',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&q=80&fit=crop',
  'RwandAir cargo aircraft being loaded at Kigali International Airport',
  'Our upgraded portal adds cargo claims, verified shipment reviews, a feedback centre, and a news hub — built for agents and shippers.',
  E'RwandAir Cargo today launches a major upgrade to its digital portal, bringing four new services to freight agents, exporters, and shippers across our 40+ destination network.\n\n## What''s new\n\n**Cargo claims, fully online.** File loss, damage, delay, shortage, or pilferage claims at [/claims](/claims) — with document upload, IATA time-limit guidance, and a reference number you can track. Acknowledgement within 72 hours.\n\n**Verified shipment reviews.** After every delivery, customers receive an invitation to rate the experience. Every published review is tied to a real air waybill — see them at [/reviews](/reviews).\n\n**A feedback centre that listens.** Tell us what to build next at [/feedback](/feedback). The most-requested routes and features are published openly on our board.\n\n**News and service alerts.** This hub brings operational alerts, route news, trade intelligence, and compliance updates into one place — subscribe by email or WhatsApp.\n\n## Why it matters\n\nKigali is Africa''s fastest-growing cargo hub. As volumes grow, the digital experience has to keep pace with the aircraft. This release is a direct response to what agents and exporters asked for in our 2026 customer survey.\n\nAs always, our 24/7 cargo desk remains available at +250 788 177 000 and cargo@rwandair.com.',
  array['portal', 'launch', 'digital'],
  array[]::text[]
),
(
  'third-weekly-sharjah-freighter-july-2026',
  'RwandAir Cargo adds a third weekly freighter to Sharjah effective 1 July 2026',
  'Route News',
  now() - interval '2 days',
  'Commercial Cargo Team',
  'Network Planning',
  'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80&fit=crop',
  'B737-800F freighter on the apron at dusk',
  'WB9304 moves to three weekly rotations on KGL–SHJ from 1 July, adding 22 tonnes of weekly capacity on the Middle East corridor.',
  E'RwandAir Cargo will operate a third weekly B737-800F freighter rotation between Kigali (KGL) and Sharjah (SHJ) effective **1 July 2026**.\n\n## Schedule\n\n| Flight | Days | Departure (KGL) | Arrival (SHJ) |\n|---|---|---|---|\n| WB9304 | Tue / Sat | 23:00 | 13:00 +1 |\n| WB9304 | Thu (new) | 23:00 | 13:00 +1 |\n\nThe additional rotation adds approximately **22 tonnes of weekly capacity** on the Middle East corridor and improves connectivity for transshipment cargo moving onward to the GCC, the Indian subcontinent, and East Asia via our Sharjah partners.\n\n## Commodities\n\nThe Thursday rotation accepts general cargo, pharmaceuticals, and high-value shipments. Perishables acceptance follows standard KGL cut-off rules: bookings at least 72 hours before departure, delivery to the cold store no later than 6 hours before STD.\n\n## Booking\n\nSpace on the new rotation is open for sale now via the portal, cargo.one, WebCargo, and CargoAi — or contact the cargo desk for block-space agreements.',
  array['sharjah', 'freighter', 'schedule'],
  array['KGL-SHJ']
),
(
  'rwanda-flower-export-season-outlook-2026',
  'Rwanda flower export season outlook: what shippers should plan for in H2 2026',
  'Trade Intelligence',
  now() - interval '4 days',
  'Trade Intelligence Unit',
  'Market Analysis',
  'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1200&q=80&fit=crop',
  'Fresh-cut roses in a cold storage facility ready for export',
  'Rose volumes are forecast up 18% for H2 2026. Belly space on EU corridors will tighten from late September — book early.',
  E'Rwanda''s floriculture sector continues its strong run. The National Agricultural Export Development Board (NAEB) forecasts cut-flower export volumes up **18% year-on-year for H2 2026**, led by rose production around Gicumbi and Rulindo.\n\n## What this means for air capacity\n\n- **September–November peak.** European demand concentrates ahead of the autumn retail season. Belly space on KGL–AMS and KGL–CDG/BRU corridors historically tightens from late September.\n- **Cold-chain throughput at KGL.** The cold store operates at near-capacity on Friday and Saturday nights in peak season. Book perishables at least 96 hours ahead for direct flights and deliver to the cold store within your confirmed acceptance window.\n- **Consolidation opportunity.** Smaller growers can cut costs up to 25% by joining consolidated shipments — our matching engine pairs compatible flower lots on the same rotation automatically.\n\n## Rates outlook\n\nWe expect spot rates on EU corridors to firm moderately in Q4. Contract shippers with committed weekly volumes are insulated from spot volatility — talk to the commercial team about block-space agreements before the peak.\n\n## The bigger picture\n\nFloriculture remains Rwanda''s flagship horticultural export, and every stem that reaches Amsterdam in under 14 hours is a case study in what cold-chain discipline at a young hub can deliver.',
  array['flowers', 'perishables', 'rwanda', 'exports'],
  array['KGL-AMS', 'KGL-CDG', 'KGL-BRU']
),
(
  'iata-dgr-2026-edition-key-changes',
  'IATA DGR 2026 (67th edition): the changes that matter for East African shippers',
  'Compliance Updates',
  now() - interval '6 days',
  'Compliance Office',
  'Dangerous Goods',
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&q=80&fit=crop',
  'Cargo handler inspecting labelled dangerous goods packages',
  'Lithium battery state-of-charge limits tighten and Section II provisions are phased out. Recheck your DG declarations before booking.',
  E'The 67th edition of the IATA Dangerous Goods Regulations (DGR) took effect on 1 January 2026. If you ship anything classified as dangerous goods through Kigali, these are the changes most likely to affect you.\n\n## Lithium batteries\n\n- **State of charge (SoC).** Standalone lithium-ion cells and batteries (UN3480) must be offered at a state of charge not exceeding 30%. From 2026, enforcement documentation requirements are stricter — declarations must state SoC compliance explicitly.\n- **Section II phase-out.** The simplified Section II provisions for small lithium cells packed with or contained in equipment continue to be phased out. Most shipments now require a full Shipper''s Declaration and DG-trained acceptance.\n\n## Classification updates\n\n- New and amended UN numbers in the 2026 edition affect certain battery-powered vehicles and sodium-ion batteries (UN3551/3552) — check the current alphabetical list before declaring.\n- Several packing instructions for Division 5.1 oxidisers were revised; verify PI numbers on existing product data sheets.\n\n## What RwandAir Cargo requires\n\nAll DG bookings need a completed Shipper''s Declaration, UN-specification packaging, and acceptance at least 24 hours before the standard cargo cut-off. Our DG-certified acceptance staff at KGL re-verify every consignment — incomplete declarations are the single most common cause of offload.\n\nQuestions about a specific commodity? Email cargo@rwandair.com with the UN number and packing group and our compliance office will confirm acceptability within one business day.',
  array['dangerous goods', 'IATA', 'compliance', 'lithium batteries'],
  array[]::text[]
);
