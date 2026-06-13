# Deployment — Agent Portal, Quote Wall, Tracker, Charter, i18n, Admin

This release (branch `feature/agent-portal-tracker-i18n`) builds on the
Claims/Reviews/Feedback/News PR. Deploy steps for the `rwandair-cargo-portal-nnvj`
Vercel project.

## 1. Database migration (Supabase)

Run **after** `002`:

```
supabase/migrations/003_agent_portal.sql
```

Creates the parallel agent-account system: `profiles` (status
registered/pending/approved/rejected; owner/sub-user via `parent_id`),
`agent_bookings`, `eawbs`, `agent_invoices`, `agent_notifications`,
`contract_rates`; the `agent_account_id()` RLS helper; and a trigger that
auto-creates a profile row on signup. No fake data is seeded.

> Auth note: profiles key off `auth.users`. The quote wall, agent registration,
> and team invites create accounts via the service role (email pre-confirmed),
> then hand the client a magic-link token to establish a session — no email
> round-trip, no passwords exposed.

## 2. Environment variables

New / required for this release (in addition to the existing Supabase + Resend set):

| Var | Used for | Required? |
|-----|----------|-----------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `/track` interactive map | Optional — falls back to a static arc + honest note if absent |
| `ADMIN_PASSWORD` | gates `/agent-admin` (agent approvals) | Required for that page; 503 until set |
| `CRON_SECRET` | authorises the rating-request cron | Recommended |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` | canonical URLs, email + portal links | Required |

Everything degrades gracefully without optional env: pages render, the map
shows a static fallback, and account-creating routes return a clean 503.

## 3. What shipped

- **Quote wall** (`/quote`): rates gated behind a free instant account
  (email + company); approved agents see contract rates; fuel + handling +
  all-in line items; out-of-standard → callback. **All carbon/CO₂ content removed.**
- **Agent portal** (`/portal/*`): login (+ optional TOTP 2FA), dashboard,
  bookings (amend/cancel windows), eAWB (459 + IATA PDF), invoices (PDF),
  contract rates, notifications + prefs, team (invite/remove sub-users),
  reports (Recharts + CSV). Gated by middleware → `/portal/login`.
- **`/capacity` and `/deals`** are now agents-only (→ `/portal/login`).
  `/api/capacity` stays public so the homepage teaser still works.
- **Tracker** (`/track`): full-page Mapbox map + milestone timeline.
- **Charter** (`/charter`): email-only request (Resend), no DB.
- **i18n**: EN/FR/AR, plain-text switcher, cookie + RTL.
- **Admin** (`/agent-admin`): `ADMIN_PASSWORD`-gated agent approvals
  (separate from the Supabase-role `/admin/*` hub). Approve/reject → emails +
  status flip (cascades to sub-users).

## 4. Cron

`vercel.json` runs `/api/cron/rating-requests` daily at 08:00 UTC (unchanged).

## 5. Redirect

`vercel.json` redirects `/agents/portal` → `/portal` (301).

## 6. Deploy

```bash
vercel --prod
```

## 7. Post-deploy checks

- [ ] Set `ADMIN_PASSWORD`, then sign in at `/agent-admin` and approve a test agent
- [ ] `/agents/register` → creates a pending profile + welcome email; appears in `/agent-admin`
- [ ] `/quote` while signed out → registration modal → rates reveal after signup
- [ ] `/capacity` and `/deals` while signed out → bounce to `/portal/login`
- [ ] `/track?awb=459-12345678` → map (or static fallback) + milestone timeline
- [ ] Switch EN/FR/AR — nav + headings translate, Arabic flips to RTL
- [ ] `/portal/awb` generates a 459 PDF; `/portal/reports` exports CSV
