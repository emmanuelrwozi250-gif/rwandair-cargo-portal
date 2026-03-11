// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Topbar Component
// Live UTC clock · 3-portal switcher · role badges · notifications
// ═══════════════════════════════════════════════════════════════════

import { showToast } from './toast.js';
import { icon } from '../utils/icons.js';

// ── Portal definitions ─────────────────────────────────────────────
export const PORTALS = [
  {
    id: 'gsa',
    label: 'GSA & Agent',
    short: 'GSA',
    icon: 'gsa',
    description: 'Space search, bookings, rates',
    defaultRoute: 'space-search',
    color: '#FEE014',
    textColor: '#001632',
  },
  {
    id: 'ops',
    label: 'Operations',
    short: 'OPS',
    icon: 'plane',
    description: 'Flights, warehouse, DG, temperature',
    defaultRoute: 'inbound',
    color: '#34D399',
    textColor: '#031A14',
  },
  {
    id: 'mgmt',
    label: 'Commercial & Mgmt',
    short: 'MGMT',
    icon: 'bar-chart',
    description: 'Revenue, yield, GSA, executive',
    defaultRoute: 'executive',
    color: '#818CF8',
    textColor: '#0F0C29',
  },
];

// ── Simulated users per portal ────────────────────────────────────
const PORTAL_USERS = {
  gsa:  { initials: 'AR', name: 'Al Rais Cargo', email: 'ops@alraiscargo.com',    role: 'GSA Manager',      level: 'L2' },
  ops:  { initials: 'RK', name: 'R. Kagabo',     email: 'r.kagabo@rwandair.com',  role: 'Ops Controller',   level: 'L3' },
  mgmt: { initials: 'JK', name: 'J. Kamau',      email: 'j.kamau@rwandair.com',   role: 'Commercial Mgr',   level: 'L4' },
};

let _currentPortal = localStorage.getItem('rw_portal') || 'mgmt';
let _clockInterval = null;

// ── Render ─────────────────────────────────────────────────────────
export function renderTopbar() {
  const user = PORTAL_USERS[_currentPortal];

  return `
  <div class="topbar">

    <!-- Brand -->
    <a class="topbar-brand" href="#" onclick="event.preventDefault();window.navigate(getCurrentPortalDefault())" aria-label="RwandAir Cargo Home">
      <div class="brand-mark">
        <img src="/assets/rwandair-cargo-symbol.svg" alt="RwandAir Cargo" width="32" height="32" style="display:block">
      </div>
      <div class="brand-text">
        <span class="brand-name">RwandAir<span style="color:var(--rw-gold);font-weight:900"> Cargo</span></span>
        <span class="brand-tagline">Intelligence Portal</span>
      </div>
    </a>

    <!-- Portal switcher (centre) -->
    <div class="topbar-centre">
      <div class="portal-tabs" id="portal-tabs" role="tablist" aria-label="Portal selection">
        ${PORTALS.map(p => `
          <button class="portal-tab ${p.id === _currentPortal ? 'active' : ''}"
                  data-portal="${p.id}"
                  role="tab"
                  aria-selected="${p.id === _currentPortal}"
                  onclick="switchPortal('${p.id}')"
                  title="${p.description}">
            ${icon(p.icon, 14)}
            <span>${p.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Right: clock + search + bell + user -->
    <div class="topbar-right">

      <!-- Live UTC Clock -->
      <div class="topbar-clock" id="topbar-clock" title="Current time in UTC">
        <span class="clock-label">UTC</span>
        <span class="clock-time" id="clock-time">--:--:--</span>
        <span class="clock-date" id="clock-date"></span>
      </div>

      <!-- Cmd+K Search -->
      <button class="topbar-search-btn" id="topbar-search-btn" title="Quick search (Cmd+K)" aria-label="Open search">
        ${icon('search', 14)}
        <span class="search-hint">⌘K</span>
      </button>

      <!-- Notifications -->
      <button class="topbar-icon-btn" id="topbar-bell" onclick="toggleNotificationPanel()" title="Notifications" aria-label="Notifications">
        ${icon('bell', 18)}
        <span class="notif-badge" id="notif-badge" style="display:none">0</span>
      </button>

      <!-- User -->
      <div class="topbar-user" id="topbar-user" onclick="toggleUserMenu()" aria-expanded="false" aria-haspopup="true">
        <div class="user-avatar" id="user-avatar">${user.initials}</div>
        <div class="user-info hide-mobile">
          <span class="user-name" id="user-name">${user.name}</span>
          <span class="user-role" id="user-role-lbl">${user.role}</span>
        </div>
        <span class="user-chevron">${icon('chevron-down', 12)}</span>

        <!-- Dropdown -->
        <div class="user-dropdown" id="user-dropdown">
          <div class="dropdown-header">
            <div class="d-name">${user.name}</div>
            <div class="d-email">${user.email}</div>
            <div class="d-role">
              <span class="access-chip ${user.level.toLowerCase()}">${user.level}</span>
              ${user.role}
            </div>
          </div>
          <div class="dropdown-section">
            <button class="dropdown-item" onclick="navigate('reports')">
              ${icon('reports', 14)}
              My Reports
            </button>
            <button class="dropdown-item" onclick="showPrefsModal()">
              ${icon('settings', 14)}
              Preferences
            </button>
            <button class="dropdown-item" onclick="showKeyboardHelp()">
              ${icon('zap', 14)}
              Keyboard Shortcuts
            </button>
          </div>
          <div class="dropdown-section">
            <div style="padding:8px 16px 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--mid)">Switch Portal</div>
            ${PORTALS.map(p => `
              <button class="dropdown-item ${p.id === _currentPortal ? 'font-semi' : ''}" onclick="switchPortal('${p.id}')">
                ${icon(p.icon, 14)}
                ${p.label}
                ${p.id === _currentPortal ? `<span style="margin-left:auto;font-size:10px;color:var(--mid)">Active</span>` : ''}
              </button>
            `).join('')}
          </div>
          <div class="dropdown-section">
            <button class="dropdown-item danger" onclick="handleLogout()">
              ${icon('log-out', 14)}
              Sign Out
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
  `;
}

// ── Live UTC Clock ─────────────────────────────────────────────────
function startClock() {
  if (_clockInterval) clearInterval(_clockInterval);

  function tick() {
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2, '0');
    const m = String(now.getUTCMinutes()).padStart(2, '0');
    const s = String(now.getUTCSeconds()).padStart(2, '0');
    const timeEl = document.getElementById('clock-time');
    const dateEl = document.getElementById('clock-date');
    if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
    if (dateEl) {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      dateEl.textContent = `${days[now.getUTCDay()]} ${now.getUTCDate()} ${months[now.getUTCMonth()]}`;
    }
  }
  tick();
  _clockInterval = setInterval(tick, 1000);
}

// ── Portal switching ───────────────────────────────────────────────
window.switchPortal = function(portalId) {
  const portal = PORTALS.find(p => p.id === portalId);
  if (!portal || portalId === _currentPortal) return;

  _currentPortal = portalId;
  localStorage.setItem('rw_portal', portalId);

  // Update body data attribute → triggers CSS portal theme
  document.body.dataset.portal = portalId;

  // Update portal tabs
  document.querySelectorAll('.portal-tab').forEach(btn => {
    const isActive = btn.dataset.portal === portalId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive);
  });

  // Update user pill
  const user = PORTAL_USERS[portalId];
  const avatarEl   = document.getElementById('user-avatar');
  const nameEl     = document.getElementById('user-name');
  const roleEl     = document.getElementById('user-role-lbl');
  if (avatarEl) avatarEl.textContent = user.initials;
  if (nameEl)   nameEl.textContent   = user.name;
  if (roleEl)   roleEl.textContent   = user.role;

  // Update sidebar nav for this portal
  if (typeof window.renderSidebarForPortal === 'function') {
    window.renderSidebarForPortal(portalId);
  }

  // Close dropdown
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.remove('open');
  document.getElementById('topbar-user')?.setAttribute('aria-expanded', 'false');

  // Navigate to portal's default page
  window.navigate(portal.defaultRoute);

  showToast(`${portal.label} Portal`, 'info', portal.description, 2500);
};

window.getCurrentPortalDefault = function() {
  return PORTALS.find(p => p.id === _currentPortal)?.defaultRoute || 'space-search';
};

window.getCurrentPortal = function() { return _currentPortal; };

// ── User menu ──────────────────────────────────────────────────────
window.toggleUserMenu = function() {
  const user  = document.getElementById('topbar-user');
  const menu  = document.getElementById('user-dropdown');
  if (!user || !menu) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  user.setAttribute('aria-expanded', String(!isOpen));
  if (!isOpen) {
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!user.contains(e.target)) {
          menu.classList.remove('open');
          user.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }
};

// ── Logout ────────────────────────────────────────────────────────
window.handleLogout = function() {
  showToast('Signing out…', 'info', 'Session ended securely', 1500);
  setTimeout(() => {
    localStorage.removeItem('rw_portal');
    window.location.hash = '';
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#001632;">
        <div style="text-align:center;animation:pageFadeIn .3s ease">
          <div style="width:72px;height:72px;background:#FEE014;border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;box-shadow:0 0 30px rgba(254,224,20,.3)">
            <span style="font-family:monospace;font-size:26px;font-weight:900;color:#001632">WB</span>
          </div>
          <h2 style="color:white;font-family:Inter,sans-serif;font-size:22px;font-weight:800">RwandAir Cargo Intelligence</h2>
          <p style="color:rgba(255,255,255,.45);margin-top:8px;font-family:Inter,sans-serif">You have been signed out securely.</p>
          <button onclick="window.location.reload()" style="margin-top:28px;padding:10px 24px;background:#FEE014;color:#001632;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:Inter,sans-serif">
            Sign In Again
          </button>
        </div>
      </div>`;
  }, 1600);
};

// ── Preferences ───────────────────────────────────────────────────
window.showPrefsModal = function() {
  showToast('Preferences', 'info', 'Settings panel coming soon', 2500);
};

window.showKeyboardHelp = function() {
  showToast('Keyboard Shortcuts', 'info', 'S = Sidebar · ⌘K = Search · ? = Help', 4000);
};

// ── Notification panel ────────────────────────────────────────────
window.toggleNotificationPanel = function() {
  document.dispatchEvent(new CustomEvent('toggle-notifications'));
};

// ── Init (called once after DOM render) ───────────────────────────
export function initTopbarInteractivity() {
  // Start clock
  startClock();

  // Apply stored portal theme
  document.body.dataset.portal = _currentPortal;

  // Cmd+K
  const searchBtn = document.getElementById('topbar-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      import('./command-palette.js').then(m => m.openPalette?.());
    });
  }
}
