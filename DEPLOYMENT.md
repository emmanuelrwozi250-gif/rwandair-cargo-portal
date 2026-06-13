# Deployment — Claims, Reviews, Feedback & News release

This release adds five feature areas (claims portal, ratings/reviews, feedback
centre, news hub, agent portal rebuild) plus homepage transactional upgrades.
Follow these steps to take it live on the `rwandair-cargo-portal-nnvj` Vercel project.

## 1. Database migration (Supabase)

Run the new migration in the Supabase SQL editor **after** `schema.sql` and `001`:

```
supabase/migrations/002_claims_reviews_feedback_news.sql
```

It creates: `claims`, `claim_events`, `rating_requests`, `ratings`,
`nps_responses`, `feedback`, `feature_requests`, `articles`, `news_subscribers`,
`agent_enquiries`; the private `claim-documents` storage bucket; and seeds the
feature-request board plus 4 launch articles (one per priority category).

All new tables have RLS enabled — public reads are limited to published/consented
rows; all writes go through API routes using the service role.

## 2. Environment variables (Vercel → Settings → Environment Variables)

Already required by the existing app:

| Var | Used for |
|-----|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | DB + storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public reads (reviews, articles, feature board) |
| `SUPABASE_SERVICE_ROLE_KEY` | all server-side writes, claim uploads |
| `RESEND_API_KEY` | claim/rating/feedback/subscribe emails |
| `ADMIN_EMAIL` | cargo-desk notification recipient |
| `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_SITE_URL` | email links, OG/canonical URLs, sitemap |

New for this release:

| Var | Used for | Required? |
|-----|----------|-----------|
| `CRON_SECRET` | authorises the rating-request cron | Recommended — set any long random string; Vercel sends it as `Authorization: Bearer …` automatically |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | WhatsApp claim & rating confirmations | Optional — code no-ops cleanly if unset |

Every integration degrades gracefully: with no Supabase, pages render with
fallbacks and form POSTs return a friendly 503; with no Resend/Twilio, the record
is still saved and notifications are skipped.

## 3. Cron job

`vercel.json` declares one cron:

```
/api/cron/rating-requests  —  0 8 * * *  (daily 08:00 UTC)
```

It scans shipments delivered >24h ago (within a 14-day backfill window), and
emails a single-use, 7-day rating token to each. Idempotent — one invite per AWB.
On Pro you can tighten the schedule to hourly (`0 * * * *`) for faster invites;
daily is chosen as the cross-plan-safe default (Hobby allows once/day).

## 4. Deploy

```bash
vercel --prod        # from repo root, project already linked to rwandair-cargo-portal-nnvj
```

The `/insights → /news` 301 redirect is in `next.config.mjs`, so existing SEO
equity carries over automatically.

## 5. Post-deploy checks

- [ ] Submit a test claim → confirm reference `WB-CLM-…` returned and confirmation email arrives
- [ ] Check claim status with that reference on the "Check claim status" tab
- [ ] `/news` shows the 4 seeded articles; an article page validates in Google's Rich Results Test (NewsArticle JSON-LD)
- [ ] `/reviews` shows the founding testimonials (empty state) until the first verified rating lands
- [ ] Submit feedback with the urgent flag → cargo-desk alert email arrives
- [ ] Navbar AWB field and hero quote widget pre-populate `/track` and `/quote`
- [ ] Google Search Console: resubmit sitemap (`/sitemap.xml` now includes news + new pages)
- [ ] Promote an admin: `update public.users set role='admin' where email='cargo@rwandair.com';` then visit `/admin/reviews`
