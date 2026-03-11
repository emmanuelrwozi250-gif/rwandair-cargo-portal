# RwandAir Cargo Intelligence Portal — v2 Audit Report

**Prototype file:** `public/portal.html` (1,979 lines)
**Audit date:** 2026-03-11
**Auditor:** Senior full-stack engineer

---

## 1.1 Inventory

| Page / Section | ID | Classification | Notes |
|---|---|---|---|
| Space & Availability Search | `page-gsa-search` | PARTIAL | Search form present but no real validation; results hardcoded/static; no loading state; no chargeable weight comparison |
| My Bookings | `page-gsa-bookings` | PARTIAL | Table present; renderMyBookings() dynamic; only 1 mock row in tbody; no filter bar; no bulk select; no side panel; no pagination |
| Shipment Tracking | `page-gsa-tracking` | PARTIAL | AWB input + showTracking() present; timeline renders; missing dwell timers; missing share link; missing SVG route map; references `track-awb-num` that does not exist in DOM |
| Rates & Pricing | `page-rates` | STUB | Static rate table only; no Add Rate modal; no inline edit; no calculator; no surcharge management; no rate history |
| Claims & Irregularities | `page-claims` | STUB | Static table; "+ File New Claim" button does nothing; no filter; no stepper; no stats chart |
| Transit Cargo (Warehouse) | `page-warehouse` | PARTIAL | Alert banners + table present; tabs are decorative only; "Detail" button calls showTL() but that function is not defined; no assign-to-flight; no dwell timer updates |
| Dwell Alerts | `page-dwell` | STUB | Static table; no trend chart; no station heat map; no count-up animation; bulk escalation does nothing |
| Inbound Today | `page-inbound` | STUB | Static table; no flight cards; no expand; no pre-arrival checklist; no print manifest |
| Outbound Today | `page-outbound` | STUB | Static table; no live cutoff countdown; no expand; no close-flight; no late acceptance |
| Dangerous Goods | `page-dg` | STUB | Static table; no IATA class colour coding per spec; no acceptance checklist; no compliance incidents section |
| Temperature-Sensitive Cargo | `page-perishable` | STUB | Static table; no status board cards; no gauge charts; no tabs |
| ULD Status | `page-uld` | STUB | Static table; not in the 20-module spec (spec has Commercial Overview instead); no interactivity |
| Capacity by Route | `page-capacity-route` | STUB | Static table only; no capacity planning 4-week view; no charts |
| Pricing Management | `page-pricing` | STUB | Static table; Update buttons do nothing; duplicate of Rates page concept |
| GSA Performance | `page-gsa-perf` | PARTIAL | Table present with real data; no detail panel; no bar chart; no "Send Report" modal |
| Yield Analysis | `page-yield` | PARTIAL | Has Chart.js canvas `ch-yield` and table; scatter plot missing; no sparklines; no 6-month trend |
| Interline Revenue | `page-interline` | STUB | Not in the 20-module spec; static table |
| Demand Forecast | `page-forecast` | PARTIAL | Has canvas `ch-forecast`; chart init present; missing drill-down |
| Space Allocation | `page-alloc` | STUB | Static table; Reallocate does nothing |
| Route Performance | `page-route-perf` | STUB | Static table; Full Report calls viewReport() which is generic |
| Seasonal Trends | `page-seasonal` | PARTIAL | Has chart canvas `ch-seasonal`; chart init present; not in 20-module spec |
| Fleet Utilisation | `page-fleet` | STUB | Static table; not in 20-module spec |
| Revenue by Market | `page-rev-market` | STUB | Static table; not in 20-module spec |
| Operational Health | `page-ops-health` | PARTIAL | RAG grid rendered; not in 20-module spec |
| Network Map | `page-network` | MISSING | Navigation items reference `sp('network')` but `page-network` does not exist in DOM |
| Commercial Overview | `page-commercial` | MISSING | Referenced as default for commercial role but `page-commercial` DOM element does not exist |
| Capacity Planning | `page-cap-plan` | MISSING | Referenced as default for planning role but `page-cap-plan` DOM element does not exist |
| Executive/Mgmt KPI | `page-mgmt` | MISSING | Referenced as default for mgmt role but `page-mgmt` DOM element does not exist |
| Reports Hub | `page-reports` | MISSING | Referenced throughout but `page-reports` DOM element does not exist |
| Notifications Panel | `notif-panel` | COMPLETE (basic) | Panel renders; toggleNotifications works; second duplicate definition at line 1311 causes id collision |
| Booking Modal | `modal` | PARTIAL | Form present; confirmBook() works with API fallback; single step only (spec requires 4-step) |
| Report Viewer | `rviewer` | STUB | Generic content; no real report data; charts missing |
| Toast System | — | COMPLETE | Full implementation with types and dismiss |
| Global Search | — | PARTIAL | Works but only ~18 items indexed; no command palette (Cmd+K); no overlay |
| Leaflet Map | — | PARTIAL | initMap() functional; only renders when page-network exists (which is missing) |
| Auth Guard | — | PARTIAL | initAuth() present; redirects to login.html; role switching works |

---

## 1.2 UX Issues

### Contrast
- `.sync` text (`rgba(255,255,255,.3)`) and `.ls` (`rgba(255,255,255,.4)`) fail WCAG AA (contrast ratio ~2.2:1, minimum 4.5:1)
- `.ni` nav items at `rgba(255,255,255,.55)` on navy background (~3.0:1) fail AA
- `.ttime` (8px font) and `.tlbl` (8px font) are below the 12px minimum readable size
- `.nbadge` at 8.5px is too small
- `.sl` (9.5px) and `.ns` (8px) section headers are too small for readability

### Missing Loading States
- No skeleton states on any page — data either appears instantly or shows a single loading row
- No spinner or progress indication on flashSearch()
- showTracking() briefly shows "Loading tracking data…" text but no skeleton animation

### Forms With No Validation
- Space search: no validation before flashSearch() runs; date defaults to today but no error if omitted
- Booking modal: shipper/consignee fields have no required validation; confirmBook() falls back to "Unnamed Shipper" silently
- Rate update buttons navigate nowhere and have no form
- Claims "File New Claim" button has no form at all

### Missing Empty States
- My Bookings: if API and localStorage are both empty, falls back to 3 hardcoded items — user never sees an empty state
- No empty state design for any table (no illustration, no call-to-action)
- Search returns `<div class="srch-empty">No results found</div>` which is a plain text fallback

### Non-Responsive Issues
- `body { overflow: hidden; height: 100vh }` breaks scroll on mobile — content is clipped
- Sidebar hides completely at 900px with no burger menu / drawer replacement
- `.main` padding reduces at 600px but tables become unscrollable (no `overflow-x: auto` wrapper)
- `.tsearch` hides at 600px with no replacement navigation for search
- `.alegs` grid collapses to single column but the complex route display still overflows

### Accessibility Gaps
- `onclick` handlers on `div.ni` elements: they are `role="button"` but missing `onkeydown` for Enter/Space keyboard activation
- Tracking timeline: no `aria-label` on step circles; purely visual colour-coding with no text alternative for red/green states
- Modal has `aria-modal="true"` but no focus trap implementation — keyboard users can tab behind the overlay
- `role="tabpanel"` on pages is incorrect without corresponding `role="tablist"` and `aria-controls`
- Emoji icons used as meaningful content without `aria-label` or `aria-hidden` siblings
- Missing `<main>` landmark; `role="main"` on a `div` is present but the outer `.body` wrapper has no landmark role

---

## 1.3 Code Quality

### Inline Styles vs CSS Classes
- Estimated 180+ inline `style="..."` attributes scattered throughout the HTML
- Examples: all leg detail containers, rate breakdown rows, modal summary grid, all loading/alert banners
- Buttons in sidebar footer use inline `onmouseover`/`onmouseout` JS for hover states instead of CSS `:hover`
- Font size overrides inline everywhere rather than semantic class variants

### Duplicated HTML
- `notif-panel` element defined **twice**: once at line 311 (static notifications) and again at line 1311 (dynamic notifications with `toggleNotifications()`). The first definition is never seen because it is behind the second one with the same id — only the last in DOM is manipulated.
- `.srch-drop` element defined twice: once inside `.tsearch` (line 298) and again as a standalone fixed element (line 1331). The JavaScript uses `getElementById` which only returns the first one.

### Hardcoded Data
- All table rows are hardcoded HTML — only `bookings-tbody` is rendered dynamically
- SEARCH_INDEX has 18 items all hardcoded inline in JavaScript
- All chart data is hardcoded inline in initMgmtCharts(), initCommercialCharts(), etc.
- switchRole() has hardcoded `um`, `ui`, `pm` objects rather than reading from a data model
- Rate table has 12 hardcoded rows, claims table 6 hardcoded rows

### XSS Risks in innerHTML
- `renderMyBookings()` (line 1693): uses template literal with `b.awb`, `b.route`, `b.shipper` etc. directly into innerHTML — these values come from localStorage or the API and are not sanitized
- `showTracking()` (lines 1751-1790): builds HTML with `shipment.shipper`, `shipment.origin`, `ev.note`, `ev.location` directly in innerHTML
- `viewReport()` (line 1797-1805): injects the `desc` parameter directly into innerHTML — callers pass fixed strings but the pattern is unsafe
- `showToast()` (line 1397-1404): injects `msg` and `sub` parameters directly into innerHTML — any caller passing user-controlled data would create XSS

### Missing Error Handling
- `initAuth()`: if fetch fails with a non-timeout error (e.g. CORS, malformed JSON), the catch block falls through silently
- `renderMyBookings()`: API error is caught but silently ignored; user gets stale or empty data with no indication
- `exportCSV()`: no error if table has 0 data rows (would produce header-only CSV without warning user)
- `initMap()`: if Leaflet CDN fails to load, the check `typeof L === 'undefined'` prevents a crash but shows nothing to the user
- Chart inits: if Chart.js CDN fails, `typeof Chart === 'undefined'` check prevents crash but shows blank white boxes with no user feedback
- No try/catch around `JSON.parse(localStorage.getItem('wb_bookings'))` — if the stored value is corrupted the app crashes

### Other Issues
- `showTL()` is called by Detail buttons in the warehouse table (line 613) but the function is never defined
- `document.getElementById('track-awb-num')` referenced in `showTracking()` (line 1722) but no element with that id exists
- All chart canvases (ch-rev, ch-lf, ch-com, ch-comm-rev) referenced in init functions but no matching DOM elements exist — the pages they belong to are missing
- `startLivePolling()` polls but only updates the live indicator label — the rest of the UI does not react to new data

---

## 1.4 Missing Features vs the 20-Module Spec

| Module | Status |
|---|---|
| 1 Space & Availability Search | Present but PARTIAL — missing: validation with inline field errors, 400ms skeleton, chargeable weight CBM×167 comparison, expandable rate breakdown, compare routes toggle, commodity warning banner, save-as-quote functionality |
| 2 My Bookings | Present but PARTIAL — missing: full 15-row mock data, filter bar (status/date/commodity), debounced live search, slide-in side panel, bulk select + CSV/cancel/copy, cancel flow with reason selector, 10-per-page pagination |
| 3 Shipment Tracking | Present but PARTIAL — missing: 6 specific AWBs from spec, 9-milestone journey (spec has more than current 6 stages), dwell time RAG between milestones, share tracking link, SVG route map |
| 4 Warehouse Transit Cargo | Present but BROKEN — showTL() undefined; missing: live dwell timer (setInterval), full detail row expansion, assign-to-flight dropdown, notify-shipper overlay, bulk action modal, sort by column, export CSV |
| 5 Dwell Alerts | Present but STUB — missing: count-up animation, station heat map CSS grid, 30-day trend chart, bulk escalation modal |
| 6 Rates & Pricing | Present (rates + pricing pages) but STUB — missing: filter bar, Add Rate modal with validation, inline edit, rate calculator panel, surcharge management, rate history |
| 7 Claims & Irregularities | Present but STUB — missing: stats donut chart, filter bar, 4-step new claim form, photo upload UI, expandable row, horizontal status stepper |
| 8 Inbound Today | Present but STUB — missing: flight cards (not table rows), expand to manifest, pre-arrival checklist (with localStorage persistence), special handling summary badges, print manifest |
| 9 Outbound Today | Present but STUB — missing: departure cards, live cutoff countdown timers, confirm/pending/offloaded sections, close flight button, late acceptance form, space available alert |
| 10 Dangerous Goods | Present but STUB — missing: IATA class colour coding per spec (9 class colours), acceptance checklist per AWB, compliance incidents section, DG quick reference table |
| 11 Temperature-Sensitive Cargo | Present but STUB — missing: card-based status board (not table), temperature excursion alert banner, gauge charts per station, tabs for Pharma/Perishables/Frozen |
| 12 Commercial Overview | MISSING — page-commercial does not exist |
| 13 GSA Performance | Present but PARTIAL — missing: right detail panel, monthly trend chart, commodity mix donut, top routes table, CASS balance display, "Send Report" modal |
| 14 Yield Analysis | Present but PARTIAL — missing: scatter plot with quadrant lines, commodity yield ranking table, 6-month rolling trend chart |
| 15 Capacity Planning | MISSING — page-cap-plan does not exist |
| 16 Network & Stations | MISSING — page-network does not exist |
| 17 Executive Dashboard | MISSING — page-mgmt does not exist |
| 18 Reports Hub | MISSING — page-reports does not exist |
| Global: Notification Centre | Partially built — no auto-generated notifications every 45s; no typed icons; mark-all-read only clears badge count |
| Global: Command Palette (Cmd+K) | MISSING — search is a small input in topbar; no Cmd+K overlay |
| Global: User Preferences | MISSING — avatar shows initials but no preference toggles (24hr, kg/lbs, USD/KES) |
| Global: Keyboard Shortcuts | MISSING — no keydown listener for G+S, G+B, N, ? etc. |
| Global: Loading Skeletons | MISSING — no shimmer CSS; only plain text "Loading…" |
| Global: New Booking Modal (multi-step) | MISSING — existing modal is single-step basic form |

---

## 1.5 Corporate Identity Compliance

| Item | Spec | Prototype | Compliant? |
|---|---|---|---|
| Primary font | Inter | Lato | NO — Lato loaded from Google Fonts; Inter not present |
| Code font | Space Mono | Space Mono | YES |
| Primary navy | `#00529B` | `#00529B` | YES |
| Navy 2 (sidebar) | `#003D73` | `#003D73` | YES |
| Navy 3 (topbar) | `#002B52` | `#002B52` | YES |
| Gold accent | `#FEE014` | `#FEE014` | YES |
| Gold 2 | `#D4B200` | `#D4B200` | YES |
| Gold light | `#FFF5B0` | `#FFF5B0` as `--goldL` (spec: `--gold-lt`) | MINOR (variable name) |
| Teal | `#1EA2DC` | `#1EA2DC` | YES |
| Lime | `#94C943` | `#94C943` | YES |
| Red | `#C0392B` | `#C0392B` | YES |
| Green | `#1A8A4A` | `#1A8A4A` | YES |
| Amber | `#D97706` | `#D97706` | YES |
| Purple | `#7C3AED` | `#7C3AED` | YES |
| Smoke | `#F1F4F9` | `#F1F4F9` | YES |
| Mid | `#6B7A99` | `#6B7A99` | YES |
| Dark | `#1A2340` | `#1A2340` | YES |
| Border | `#DDE3EE` | `#DDE3EE` | YES |
| Topbar height | 52px | 50px | MINOR deviation |
| Role tabs | named as per spec | Present and functional | YES |
| WB logo mark | gold square + "WB" navy | Present | YES |
| Sidebar width | 220px | `--sw: 230px` | MINOR (+10px) |
| Sidebar font size | Inter weights 300–800 | Lato | NO |
| Font weights loaded | 300,400,500,600,700,800 | 300,400,700,900 (Lato) | NO — wrong weights; 500,600,800 missing |
| Topbar gold border | 2px solid gold | 2px solid gold | YES |
| Sidebar active: gold left border | Present | Present | YES |
| Sidebar active: gold text + rgba(gold,0.1) bg | Present | Present | YES |

**Summary of non-compliance:**
1. Font is Lato throughout; spec requires Inter. This is the most significant brand deviation.
2. Topbar height 50px vs spec 52px.
3. Sidebar width 230px vs spec 220px.
4. Font weight 900 loaded (unavailable in Inter anyway) instead of 500, 600, 800.
