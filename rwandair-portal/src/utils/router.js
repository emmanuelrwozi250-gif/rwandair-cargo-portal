// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Hash-Based Client-Side Router
// No bundler required — pure ES modules
// ═══════════════════════════════════════════════════════════════════

const routes = {};
let currentPage = null;
let afterNav = null;

/**
 * Register a route handler
 * @param {string} hash - Route hash (without #)
 * @param {{ render: Function, init?: Function }} handler
 */
export function registerRoute(hash, handler) {
  routes[hash] = handler;
}

/**
 * Navigate to a hash route
 * @param {string} hash
 */
export function navigate(hash) {
  window.location.hash = hash;
}

/**
 * Register a callback called after every navigation
 * @param {Function} fn
 */
export function onAfterNavigate(fn) {
  afterNav = fn;
}

/**
 * Initialise the router and render the default page
 * @param {string} defaultHash
 */
export function initRouter(defaultHash = 'space-search') {
  async function render() {
    const hash = window.location.hash.slice(1) || defaultHash;
    const handler = routes[hash] || routes[defaultHash];
    if (!handler) return;

    const main = document.getElementById('main-content');
    if (!main) return;

    // Show skeleton while loading
    main.innerHTML = `<div class="skeleton-page">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-kpi-row">
        <div class="skeleton skeleton-kpi"></div>
        <div class="skeleton skeleton-kpi"></div>
        <div class="skeleton skeleton-kpi"></div>
        <div class="skeleton skeleton-kpi"></div>
      </div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>`;

    currentPage = hash;
    updateSidebarActive(hash);

    try {
      // Simulate 300ms loading delay for skeleton UX
      const [html] = await Promise.all([
        Promise.resolve(handler.render()),
        new Promise(r => setTimeout(r, 300))
      ]);
      main.innerHTML = html;
      if (handler.init) setTimeout(() => handler.init(main), 10);
    } catch (e) {
      console.error('Router render error:', e);
      main.innerHTML = errorState('Page failed to load', e.message, () => render());
    }

    if (afterNav) afterNav(hash);
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  render();
}

/** Update sidebar active state */
function updateSidebarActive(hash) {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === hash);
  });
}

/** Get current page hash */
export function getCurrentPage() {
  return currentPage;
}

/**
 * Render an error state
 * @param {string} title
 * @param {string} msg
 * @param {Function} retryFn
 */
export function errorState(title, msg, retryFn) {
  return `<div class="empty-state error-state">
    <div class="empty-icon">⚠️</div>
    <div class="empty-title">${title}</div>
    <div class="empty-sub">${msg || 'An unexpected error occurred.'}</div>
    <button class="btn btn-pri" onclick="(${retryFn.toString()})()">Retry</button>
  </div>`;
}

/**
 * Render an empty state
 */
export function emptyState(icon, title, sub, ctaHtml = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <div class="empty-title">${title}</div>
    <div class="empty-sub">${sub}</div>
    ${ctaHtml}
  </div>`;
}

/**
 * Render skeleton rows
 * @param {number} rows
 */
export function skeleton(rows = 4) {
  return `<div class="skeleton-wrap">${Array(rows).fill('<div class="skeleton skeleton-row"></div>').join('')}</div>`;
}
