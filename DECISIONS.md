# RwandAir Cargo Intelligence Portal — Architecture Decisions

**Author:** Senior full-stack engineer
**Date:** 2026-03-11
**Project:** Rebuild of monolithic portal.html → clean multi-file vanilla JS SPA

---

## Decision 1: No Build Tooling

**Decision:** Pure vanilla JS with ES modules (`type="module"` in index.html). No Webpack, Vite, Rollup, or npm.

**Rationale:**
- The brief explicitly states "no frameworks, no build tools"
- Eliminates npm dependency chain vulnerability surface
- Any staff member can open and read the source files without tooling
- Browser ES module support is now universal for the target deployment environment
- Allows `import` / `export` syntax cleanly without polyfills

**Trade-offs accepted:**
- No tree shaking (all data files load even if a page isn't visited)
- No TypeScript (JSDoc comments used for type documentation instead)
- Module loading order must be managed manually in index.html

---

## Decision 2: Hash-Based Client-Side Router

**Decision:** A minimal hash router in `src/utils/router.js` that listens to `window.onhashchange` and calls the appropriate page module's `render()` and `init()` functions.

**Rationale:**
- Hash routing requires no server configuration (the portal will run from `file://` or any static host)
- Bookmarkable URLs work without server-side routing rules
- Browser back/forward works correctly
- No 404 errors on direct navigation

**Route format:** `#space-search`, `#bookings`, `#tracking`, etc.
**Default route:** `#space-search`

**Implementation pattern:**
```js
// router.js
const routes = { 'space-search': () => import('../pages/space-search.js'), ... }
window.addEventListener('hashchange', () => router.navigate(location.hash.slice(1)));
```

---

## Decision 3: Page Module Architecture (render + init)

**Decision:** Each page is a JS module exporting:
- `render()` → returns HTML string
- `init(container)` → attaches event listeners, creates charts, starts timers

**Rationale:**
- Clean separation between template and behaviour
- Router can call `container.innerHTML = render()` then `init(container)` consistently
- Easy to test render() in isolation (returns a string)
- init() can be debounced — charts are only created after DOM is painted

**Pattern:**
```js
export const render = () => `<div class="page-wrapper">...</div>`;
export const init = (el) => {
  el.querySelector('.some-btn').addEventListener('click', handler);
  createChart(el.querySelector('canvas'));
};
```

---

## Decision 4: In-Memory State Store

**Decision:** A simple observable store in `src/utils/storage.js` using a plain JS object and a pub/sub pattern. No IndexedDB, no localStorage persistence for UI state.

**Rationale:**
- Data files provide mock data — no server connection needed
- localStorage is used only for user preferences and auth token
- In-memory store means consistent state across page navigations within a session
- Avoids complexity of persistence sync; data resets on page reload (acceptable for demo/ops portal)

**Store shape:**
```js
window._store = {
  bookings: [...],
  awbs: [...],
  quotes: [],
  prefs: { timeFormat: '24h', weightUnit: 'kg', currency: 'USD' }
}
```

---

## Decision 5: Chart Library — Chart.js 4.4.0

**Decision:** Chart.js loaded from CDN (`cdn.jsdelivr.net/npm/chart.js@4.4.0`).

**Rationale:**
- Already used in the prototype (proven compatible with the page stack)
- Rich chart type support: bar, line, doughnut, scatter — all needed for the spec
- No build step required (UMD bundle works via CDN)
- 60KB gzipped — acceptable for an internal business portal
- SVG arc gauge for Executive Dashboard implemented as custom SVG + Chart.js doughnut

**Wrapper:** `src/utils/charts.js` provides `createChart(canvasEl, config)` that handles:
- Destroying existing chart instance before recreating (prevents canvas conflict)
- Injecting Inter font family into all Chart.js defaults
- Consistent colour palette using CSS variable values

---

## Decision 6: Leaflet 1.9.4 for Network Map

**Decision:** Leaflet loaded from CDN for the Network & Stations map.

**Rationale:**
- Open-source, no API key required
- Used in the prototype — proven working
- Lightweight (~40KB gzipped)
- OpenStreetMap tiles are free for internal use

---

## Decision 7: Data Layer — Static JS Files with Import

**Decision:** All mock data lives in `src/data/*.js` as exported const arrays/objects. Page files import from data files.

**Rationale:**
- Clear separation of concerns: data vs presentation
- Data can be replaced by an API layer later by swapping imports
- All data is type-consistent and internally cross-referenced (AWB numbers in bookings.js match awbs.js)

**Data consistency rules enforced:**
- AWB numbers in `bookings.js` reference records in `awbs.js`
- Flight numbers in `awbs.js` timelines reference records in `flights.js`
- GSA names in `bookings.js` reference records in `gsas.js`
- Station IATA codes reference records in `stations.js`

---

## Decision 8: CSS Architecture — Four Files, No CSS-in-JS

**Decision:**
- `global.css` — `:root` variables, resets, typography
- `components.css` — all reusable components (buttons, cards, tables, pills, badges)
- `layout.css` — topbar, sidebar, main content shell
- `animations.css` — skeleton shimmer, transitions, count-up

**Rationale:**
- Avoids all inline styles (a major audit finding in v1)
- Specificity is predictable — layout never fights components
- animations.css is small and focused; can be disabled for reduced-motion preference
- Zero CSS variables hardcoded in component files — all colours reference `:root` variables

---

## Decision 9: Security — No innerHTML with User Data

**Decision:** All user-controlled or API-sourced values are set via `textContent` or `createElement`. Template literals with innerHTML are only used for static structural HTML with no interpolated user values. Where interpolation is necessary (e.g. AWB numbers in table cells), values are sanitized via a `sanitize(str)` helper.

**Rationale:**
- Audit found multiple XSS risks in v1
- `sanitize()` uses `document.createElement('div').textContent = str; return div.innerHTML` pattern — browser-safe escaping

---

## Decision 10: Accessibility — Keyboard Navigation and ARIA

**Decision:**
- All interactive sidebar items are `<button>` elements (not `div.onclick`)
- Modal focus trap implemented with Tab/Shift+Tab keydown handlers
- Skeleton states announce via `aria-busy="true"` on containers
- Colour-coded statuses always have text labels alongside colour
- ARIA live regions on notification dropdown and toast container
- `prefers-reduced-motion` media query disables skeleton shimmer animation

---

## File Structure

```
rwandair-portal/
  index.html                  ← Entry point; loads all CSS + JS
  src/
    styles/
      global.css              ← :root vars, reset, typography (Inter)
      components.css          ← buttons, cards, tables, forms, pills
      layout.css              ← topbar (52px), sidebar (220px), shell
      animations.css          ← skeleton shimmer, transitions, loaders
    components/
      topbar.js               ← renders topbar HTML + role tabs + user menu
      sidebar.js              ← renders sidebar nav per role + collapse
      notifications.js        ← bell dropdown + 45s auto-notification
      command-palette.js      ← Cmd+K overlay with grouped results
      modals.js               ← modal open/close/focus-trap + multi-step booking
      toast.js                ← toast system (success/error/warning/info/primary)
    data/
      awbs.js                 ← 20 AWBs with full timeline arrays
      bookings.js             ← 15 booking records
      flights.js              ← 30 flight records (next 7 days)
      gsas.js                 ← 12 GSA records
      claims.js               ← 10 claims records
      rates.js                ← rate cards for 12 route pairs
      stations.js             ← 20 stations
      revenue.js              ← 12 months rolling revenue
      notifications.js        ← 15 notification records
    utils/
      format.js               ← formatNumber(), formatDate(), formatAWB(), sanitize()
      router.js               ← hash router
      storage.js              ← in-memory store + localStorage wrapper
      charts.js               ← Chart.js helper wrappers with brand defaults
    pages/
      space-search.js         ← Module 1
      my-bookings.js          ← Module 2
      tracking.js             ← Module 3
      warehouse.js            ← Module 4
      dwell-alerts.js         ← Module 5
      rates.js                ← Module 6
      claims.js               ← Module 7
      inbound.js              ← Module 8
      outbound.js             ← Module 9
      dangerous-goods.js      ← Module 10
      temperature.js          ← Module 11
      commercial.js           ← Module 12
      gsa-performance.js      ← Module 13
      yield.js                ← Module 14
      capacity.js             ← Module 15
      network.js              ← Module 16
      executive.js            ← Module 17
      reports.js              ← Module 18
```

---

## Dependency Map

```
index.html
  └── loads all CSS files
  └── loads Chart.js (CDN)
  └── loads Leaflet (CDN)
  └── loads src/utils/format.js    (no deps)
  └── loads src/utils/storage.js   (no deps)
  └── loads src/utils/charts.js    (depends on Chart.js global)
  └── loads src/utils/router.js    (depends on all page modules)
  └── loads src/data/*.js          (no deps — pure data)
  └── loads src/components/toast.js        (no deps)
  └── loads src/components/modals.js       (depends on data/*, utils/format)
  └── loads src/components/notifications.js (depends on data/notifications)
  └── loads src/components/command-palette.js (depends on data/*)
  └── loads src/components/topbar.js       (depends on toast, modals, notifications, command-palette)
  └── loads src/components/sidebar.js      (depends on router)
  └── loads src/pages/*.js                 (each depends on data/*, utils/*)
  └── loads app.js (inline in index.html)  ← bootstraps router, topbar, sidebar
```
