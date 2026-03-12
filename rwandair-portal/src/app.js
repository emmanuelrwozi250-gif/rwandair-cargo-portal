// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — App Entry Point
// Pure ES Modules, no bundler · Three portals · Role-based access
// ═══════════════════════════════════════════════════════════════════

// ── Utils & Components ────────────────────────────────────────────
import { initRouter, registerRoute, navigate }   from './utils/router.js';
import { showToast }                              from './components/toast.js';
import { renderTopbar, initTopbarInteractivity }  from './components/topbar.js';
import { renderSidebar }                          from './components/sidebar.js';
import { initNotifications }                      from './components/notifications.js';
import { initCommandPalette }                     from './components/command-palette.js';
import { initModals }                             from './components/modals.js';
import { initAlertEngine }                        from './utils/alert-engine.js';

// ── Page Handlers ─────────────────────────────────────────────────
import { handler as spaceSearchHandler }    from './pages/space-search.js?v=4';
import { handler as bookingsHandler }       from './pages/bookings.js?v=4';
import { handler as trackingHandler }       from './pages/tracking.js?v=4';
import { handler as warehouseHandler }      from './pages/warehouse.js?v=4';
import { handler as dwellAlertsHandler }    from './pages/dwell-alerts.js?v=4';
import { handler as ratesHandler }          from './pages/rates.js?v=4';
import { handler as claimsHandler }         from './pages/claims.js?v=4';
import { handler as inboundHandler }        from './pages/inbound.js?v=4';
import { handler as outboundHandler }       from './pages/outbound.js?v=4';
import { handler as dangerousGoodsHandler } from './pages/dangerous-goods.js?v=4';
import { handler as temperatureHandler }    from './pages/temperature.js?v=4';
import { handler as commercialHandler }     from './pages/commercial.js?v=4';
import { handler as gsaPerformanceHandler } from './pages/gsa-performance.js?v=4';
import { handler as yieldHandler }          from './pages/yield.js?v=4';
import { handler as capacityHandler }       from './pages/capacity.js?v=4';
import { handler as networkHandler }        from './pages/network.js?v=4';
import { handler as executiveHandler }      from './pages/executive.js?v=4';
import { handler as reportsHandler }        from './pages/reports.js?v=4';
import { handler as contractTrackerHandler } from './pages/contract-tracker.js?v=4';
import { handler as inventoryHandler }       from './pages/inventory.js?v=4';
import { handler as disruptionsHandler }     from './pages/disruptions.js?v=4';

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
  ['contract-tracker', contractTrackerHandler],
  ['inventory',        inventoryHandler],
  ['disruptions',      disruptionsHandler],
];

ROUTES.forEach(([hash, handler]) => registerRoute(hash, handler));

// ── Determine active portal & default route ───────────────────────
// Supports deep-link params: ?portal=gsa&route=tracking
const _urlParams = new URLSearchParams(window.location.search);
const _urlPortal = _urlParams.get('portal');
const _validPortals = ['gsa', 'ops', 'mgmt'];
if (_urlPortal && _validPortals.includes(_urlPortal)) {
  localStorage.setItem('rw_portal', _urlPortal);
}
const activePortal = localStorage.getItem('rw_portal') || 'mgmt';
const portalDefaults = {
  gsa:  'space-search',
  ops:  'inbound',
  mgmt: 'executive',
};
const _urlRoute = _urlParams.get('route');
const defaultRoute = _urlRoute || portalDefaults[activePortal] || 'executive';

// Apply portal theme to DOM
document.body.dataset.portal = activePortal;

// ── Render shell ──────────────────────────────────────────────────
document.getElementById('topbar').innerHTML  = renderTopbar();
document.getElementById('sidebar').innerHTML = renderSidebar(activePortal);

// ── Initialise interactivity ──────────────────────────────────────
initTopbarInteractivity();   // start UTC clock, Cmd+K binding, portal theme
initNotifications();
initCommandPalette();
initModals();
initAlertEngine();

// ── Start router ──────────────────────────────────────────────────
initRouter(defaultRoute);

// ── Welcome toast ─────────────────────────────────────────────────
const portalNames = { gsa: 'GSA & Agent', ops: 'Operations', mgmt: 'Commercial & Management' };
setTimeout(() => {
  showToast(
    `${portalNames[activePortal] || 'Intelligence'} Portal`,
    'info',
    'All systems operational',
    1500
  );
}, 600);

// ── Global navigate exposed ───────────────────────────────────────
window.navigate = navigate;

// ── Global error handler ──────────────────────────────────────────
window.addEventListener('error', (e) => {
  console.error('[RwCargo]', e.error || e.message);
  showToast('Application Error', 'error', e.message?.slice(0, 100), 5000);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[RwCargo] Unhandled promise:', e.reason);
});
