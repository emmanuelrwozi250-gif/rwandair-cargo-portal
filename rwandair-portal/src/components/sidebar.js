// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Sidebar Navigation Component
// ═══════════════════════════════════════════════════════════════════

const NAV_SECTIONS = [
  {
    label: 'Bookings & Search',
    items: [
      { route: 'space-search', label: 'Space Search', icon: '🔍', badge: null },
      { route: 'bookings',     label: 'My Bookings',  icon: '📋', badge: null },
      { route: 'tracking',     label: 'Track Shipment', icon: '📡', badge: null },
      { route: 'rates',        label: 'Rate Cards',   icon: '💰', badge: null },
    ]
  },
  {
    label: 'Operations',
    items: [
      { route: 'inbound',      label: 'Inbound Flights',  icon: '🛬', badge: null },
      { route: 'outbound',     label: 'Outbound',         icon: '🛫', badge: null },
      { route: 'warehouse',    label: 'Warehouse',        icon: '🏭', badge: '3' },
      { route: 'dwell-alerts', label: 'Dwell Alerts',     icon: '⏰', badge: '7', badgeColor: 'danger' },
      { route: 'dangerous-goods', label: 'Dangerous Goods', icon: '☢', badge: null },
      { route: 'temperature',  label: 'Temperature',      icon: '🌡', badge: '1', badgeColor: 'danger' },
    ]
  },
  {
    label: 'Commercial',
    items: [
      { route: 'commercial',      label: 'Commercial',       icon: '📊', badge: null },
      { route: 'gsa-performance', label: 'GSA Performance',  icon: '🤝', badge: null },
      { route: 'yield',           label: 'Yield Analysis',   icon: '📈', badge: null },
      { route: 'capacity',        label: 'Capacity',         icon: '✈',  badge: null },
      { route: 'network',         label: 'Network',          icon: '🌍', badge: null },
    ]
  },
  {
    label: 'Management',
    items: [
      { route: 'claims',    label: 'Claims',       icon: '⚖',  badge: null },
      { route: 'executive', label: 'Executive',    icon: '👔', badge: null },
      { route: 'reports',   label: 'Reports',      icon: '📑', badge: null },
    ]
  }
];

/**
 * Render the sidebar HTML string
 */
export function renderSidebar() {
  const currentHash = window.location.hash.slice(1) || 'space-search';

  const sectionsHtml = NAV_SECTIONS.map(section => `
    <div class="nav-section">
      <div class="nav-section-label">${section.label}</div>
      ${section.items.map(item => `
        <a class="nav-item ${item.route === currentHash ? 'active' : ''}"
           data-route="${item.route}"
           href="#${item.route}"
           title="${item.label}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
          ${item.badge ? `<span class="nav-badge ${item.badgeColor === 'danger' ? 'nav-badge-danger' : ''}">${item.badge}</span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `
  <div class="sidebar" id="sidebar">
    <!-- Sidebar toggle -->
    <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleSidebar()" title="Toggle sidebar (S)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <!-- Navigation -->
    <nav class="sidebar-nav" id="sidebar-nav">
      ${sectionsHtml}
    </nav>

    <!-- Sign out -->
    <div class="sidebar-footer">
      <div class="sidebar-version">v2.0.0 — W25/S26</div>
      <button class="nav-item nav-item-signout" onclick="handleLogout()">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">Sign Out</span>
      </button>
    </div>
  </div>
  `;
}

// ── Sidebar collapse ──────────────────────────────────────────────

let _collapsed = false;

window.toggleSidebar = function() {
  _collapsed = !_collapsed;
  const sidebar = document.getElementById('sidebar');
  const layout = document.getElementById('layout');
  if (sidebar) sidebar.classList.toggle('collapsed', _collapsed);
  if (layout) layout.classList.toggle('sidebar-collapsed', _collapsed);
};

// 'S' key shortcut
document.addEventListener('keydown', e => {
  if (e.key === 's' || e.key === 'S') {
    if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      window.toggleSidebar();
    }
  }
});
