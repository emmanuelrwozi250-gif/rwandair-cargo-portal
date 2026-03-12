// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Sidebar Navigation
// Portal-aware nav · SVG icons · access levels · live badges
// ═══════════════════════════════════════════════════════════════════

import { icon } from '../utils/icons.js';

// ── Navigation structure per portal ───────────────────────────────
const PORTAL_NAV = {

  // ── GSA & Agent Portal ─────────────────────────────────────────
  gsa: {
    portalName: 'GSA & Agent Portal',
    sections: [
      {
        label: 'Search & Book',
        items: [
          { route: 'space-search', label: 'Space Search',    icon: 'search',   badge: null },
          { route: 'bookings',     label: 'My Bookings',     icon: 'bookings', badge: null },
          { route: 'tracking',     label: 'Track Shipment',  icon: 'tracking', badge: null },
          { route: 'rates',        label: 'Rate Cards',      icon: 'rates',    badge: null },
        ]
      },
      {
        label: 'Cargo Management',
        items: [
          { route: 'claims',       label: 'My Claims',       icon: 'claims',   badge: null },
          { route: 'temperature',  label: 'Cold Chain',      icon: 'temperature', badge: null },
        ]
      }
    ]
  },

  // ── Operations Portal ──────────────────────────────────────────
  ops: {
    portalName: 'Operations Portal',
    sections: [
      {
        label: "Today's Flights",
        items: [
          { route: 'inbound',      label: 'Inbound Flights', icon: 'plane-in',  badge: null },
          { route: 'outbound',     label: 'Outbound Flights',icon: 'plane-out', badge: null },
          { route: 'space-search', label: 'Capacity',        icon: 'capacity',  badge: null },
        ]
      },
      {
        label: 'Warehouse & Cargo',
        items: [
          { route: 'warehouse',       label: 'Warehouse',       icon: 'warehouse', badge: '3', badgeType: 'warn' },
          { route: 'inventory',       label: 'Inventory',       icon: 'list',      badge: null },
          { route: 'dwell-alerts',    label: 'Dwell Alerts',    icon: 'dwell',     badge: '7', badgeType: 'danger' },
          { route: 'dangerous-goods', label: 'Dangerous Goods', icon: 'hazmat',    badge: null },
          { route: 'temperature',     label: 'Temperature Control', icon: 'temperature', badge: '1', badgeType: 'danger' },
        ]
      },
      {
        label: 'Tracking',
        items: [
          { route: 'tracking',     label: 'Track Shipment',  icon: 'tracking',        badge: null },
          { route: 'bookings',     label: 'All Bookings',    icon: 'bookings',        badge: null },
          { route: 'disruptions',  label: 'Disruptions',     icon: 'alert-triangle',  badge: '3', badgeType: 'danger' },
        ]
      }
    ]
  },

  // ── Commercial & Management Portal ────────────────────────────
  mgmt: {
    portalName: 'Commercial & Management',
    sections: [
      {
        label: 'Revenue & Performance',
        items: [
          { route: 'executive',       label: 'Executive Dashboard', icon: 'executive',  badge: null },
          { route: 'commercial',      label: 'Commercial',          icon: 'commercial', badge: null },
          { route: 'yield',           label: 'Yield Analysis',      icon: 'yield',      badge: null },
        ]
      },
      {
        label: 'GSA & Network',
        items: [
          { route: 'gsa-performance', label: 'GSA Performance',     icon: 'gsa',        badge: null },
          { route: 'network',         label: 'Network Map',         icon: 'network',    badge: null },
          { route: 'capacity',        label: 'Capacity Planning',   icon: 'capacity',   badge: null },
        ]
      },
      {
        label: 'Operations View',
        items: [
          { route: 'inbound',         label: 'Inbound Flights',     icon: 'plane-in',   badge: null },
          { route: 'outbound',        label: 'Outbound Flights',    icon: 'plane-out',  badge: null },
          { route: 'warehouse',       label: 'Warehouse',           icon: 'warehouse',  badge: null },
          { route: 'inventory',       label: 'Inventory',           icon: 'list',       badge: null },
          { route: 'dwell-alerts',    label: 'Dwell Alerts',        icon: 'dwell',      badge: '7', badgeType: 'danger' },
          { route: 'disruptions',     label: 'Disruptions',         icon: 'alert-triangle', badge: '3', badgeType: 'danger' },
          { route: 'temperature',     label: 'Temperature',         icon: 'temperature',badge: null },
        ]
      },
      {
        label: 'Management',
        items: [
          { route: 'claims',            label: 'Claims',              icon: 'claims',     badge: null },
          { route: 'contract-tracker', label: 'Contracts',           icon: 'contract',   badge: null },
          { route: 'reports',          label: 'Reports',             icon: 'reports',    badge: null },
        ]
      }
    ]
  }
};

// ── Render ─────────────────────────────────────────────────────────
export function renderSidebar(portalId) {
  const portal = portalId || localStorage.getItem('rw_portal') || 'mgmt';
  const config = PORTAL_NAV[portal] || PORTAL_NAV.mgmt;
  const currentHash = window.location.hash.slice(1) || config.sections[0]?.items[0]?.route;

  const sectionsHtml = config.sections.map(section => `
    <div class="nav-section">
      <span class="nav-section-label">${section.label}</span>
      ${section.items.map(item => `
        <a class="nav-item ${item.route === currentHash ? 'active' : ''}"
           data-route="${item.route}"
           href="#${item.route}"
           title="${item.label}">
          <span class="nav-icon">${icon(item.icon, 16)}</span>
          <span class="nav-label">${item.label}</span>
          ${item.badge ? `<span class="nav-badge ${item.badgeType === 'danger' ? '' : 'warn'}">${item.badge}</span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `
  <div class="sidebar-inner">

    <!-- Portal badge -->
    <div class="sidebar-portal-badge">
      <div class="sidebar-portal-line"></div>
      <span class="sidebar-portal-name">${config.portalName}</span>
    </div>

    <!-- Toggle button (absolute positioned) -->
    <button class="sidebar-toggle" id="sidebar-toggle" onclick="toggleSidebar()" title="Toggle sidebar (S)" aria-label="Toggle sidebar">
      ${icon('chevron-left', 12)}
    </button>

    <!-- Navigation -->
    <nav class="sidebar-nav" id="sidebar-nav" aria-label="${config.portalName} navigation">
      ${sectionsHtml}
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <span class="sidebar-footer-text">v2.1.0 · W25/S26 Season</span>
      <button class="sidebar-signout" onclick="handleLogout()" aria-label="Sign out">
        ${icon('log-out', 14)}
        <span class="nav-label">Sign Out</span>
      </button>
    </div>

  </div>
  `;
}

// ── Re-render sidebar when portal changes ─────────────────────────
window.renderSidebarForPortal = function(portalId) {
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) {
    sidebarEl.innerHTML = renderSidebar(portalId);
    // Re-attach sidebar toggle since DOM was replaced
    initSidebarState();
  }
};

// ── Collapse / expand ─────────────────────────────────────────────
let _collapsed = false;

function initSidebarState() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (_collapsed) {
    sidebar.classList.add('collapsed');
    document.body.classList.add('sidebar-collapsed');
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) toggle.innerHTML = icon('chevron-right', 12);
  }
}

window.toggleSidebar = function() {
  _collapsed = !_collapsed;
  const sidebar  = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');

  if (sidebar) {
    sidebar.classList.toggle('collapsed', _collapsed);
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) toggle.innerHTML = icon(_collapsed ? 'chevron-right' : 'chevron-left', 12);
  }
  if (mainContent) {
    mainContent.style.marginLeft = _collapsed
      ? 'var(--sidebar-collapsed-w)'
      : 'var(--sidebar-w)';
  }
  document.body.classList.toggle('sidebar-collapsed', _collapsed);
};

// 'S' key shortcut
document.addEventListener('keydown', e => {
  if ((e.key === 's' || e.key === 'S') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    window.toggleSidebar();
  }
});

// ── Highlight active nav item on hash change ───────────────────────
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.route === hash);
  });
});
