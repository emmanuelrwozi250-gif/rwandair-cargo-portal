// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — App Entry Point
// Pure ES Modules, no bundler. Opens via index.html
// ═══════════════════════════════════════════════════════════════════

// ── Utils & Components ────────────────────────────────────────────
import { initRouter, registerRoute, navigate }         from './utils/router.js';
import { showToast }                                    from './components/toast.js';
import { renderTopbar }                                  from './components/topbar.js';
import { renderSidebar }                                from './components/sidebar.js';
import { initNotifications }                            from './components/notifications.js';
import { initCommandPalette }                           from './components/command-palette.js';
import { initModals }                                   from './components/modals.js';

// ── Page Handlers ────────────────────────────────────────────────
import { handler as spaceSearchHandler }    from './pages/space-search.js';
import { handler as bookingsHandler }       from './pages/bookings.js';
import { handler as trackingHandler }       from './pages/tracking.js';
import { handler as warehouseHandler }      from './pages/warehouse.js';
import { handler as dwellAlertsHandler }    from './pages/dwell-alerts.js';
import { handler as ratesHandler }          from './pages/rates.js';
import { handler as claimsHandler }         from './pages/claims.js';
import { handler as inboundHandler }        from './pages/inbound.js';
import { handler as outboundHandler }       from './pages/outbound.js';
import { handler as dangerousGoodsHandler } from './pages/dangerous-goods.js';
import { handler as temperatureHandler }    from './pages/temperature.js';
import { handler as commercialHandler }     from './pages/commercial.js';
import { handler as gsaPerformanceHandler } from './pages/gsa-performance.js';
import { handler as yieldHandler }          from './pages/yield.js';
import { handler as capacityHandler }       from './pages/capacity.js';
import { handler as networkHandler }        from './pages/network.js';
import { handler as executiveHandler }      from './pages/executive.js';
import { handler as reportsHandler }        from './pages/reports.js';

// ── Register all routes ───────────────────────────────────────────
const ROUTES = [
  ['space-search',    spaceSearchHandler],
  ['bookings',        bookingsHandler],
  ['tracking',        trackingHandler],
  ['warehouse',       warehouseHandler],
  ['dwell-alerts',    dwellAlertsHandler],
  ['rates',           ratesHandler],
  ['claims',          claimsHandler],
  ['inbound',         inboundHandler],
  ['outbound',        outboundHandler],
  ['dangerous-goods', dangerousGoodsHandler],
  ['temperature',     temperatureHandler],
  ['commercial',      commercialHandler],
  ['gsa-performance', gsaPerformanceHandler],
  ['yield',           yieldHandler],
  ['capacity',        capacityHandler],
  ['network',         networkHandler],
  ['executive',       executiveHandler],
  ['reports',         reportsHandler],
];

ROUTES.forEach(([hash, handler]) => registerRoute(hash, handler));

// ── Render shell ──────────────────────────────────────────────────
document.getElementById('topbar').innerHTML    = renderTopbar();
document.getElementById('sidebar').innerHTML   = renderSidebar();

// ── Initialise components ─────────────────────────────────────────
// (topbar & sidebar register globals automatically on import)
initNotifications();
initCommandPalette();
initModals();

// ── Start router (default: space-search) ─────────────────────────
initRouter('space-search');

// ── Welcome toast (500ms delay so UI is painted) ─────────────────
setTimeout(() => {
  showToast('Welcome to RwandAir Cargo Intelligence', 'info',
    'Portal loaded · All systems operational', 3500);
}, 500);

// ── Global error handler ─────────────────────────────────────────
window.addEventListener('error', (e) => {
  console.error('App error:', e);
  showToast('Application error', 'error', e.message, 5000);
});

// ── Expose navigate globally (for onclick= in HTML templates) ─────
window.navigate = navigate;
