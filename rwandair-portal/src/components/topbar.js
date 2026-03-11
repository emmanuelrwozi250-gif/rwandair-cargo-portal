// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Top Bar Component
// ═══════════════════════════════════════════════════════════════════

import { showToast } from './toast.js';

const ROLES = [
  { id: 'agent',      label: 'GSA / Agent',     icon: '🤝' },
  { id: 'warehouse',  label: 'Warehouse Ops',   icon: '📦' },
  { id: 'commercial', label: 'HQ Commercial',   icon: '📈' },
  { id: 'planning',   label: 'Planning',        icon: '✈' },
  { id: 'management', label: 'Management',      icon: '👔' },
];

let _currentRole = 'commercial';

/**
 * Render the topbar HTML string
 */
export function renderTopbar() {
  return `
  <div class="topbar">
    <!-- Logo mark -->
    <div class="topbar-brand" onclick="window.location.hash='space-search'" style="cursor:pointer">
      <div class="wb-logo-mark">
        <span class="wb-text">WB</span>
      </div>
      <div class="topbar-brand-text">
        <span class="topbar-name">RwandAir Cargo</span>
        <span class="topbar-sub">Intelligence Portal</span>
      </div>
    </div>

    <!-- Role tabs -->
    <div class="topbar-roles" id="topbar-roles">
      ${ROLES.map(r => `
        <button class="role-tab ${r.id === _currentRole ? 'active' : ''}"
                data-role="${r.id}"
                onclick="setRole('${r.id}')">
          ${r.label}
        </button>
      `).join('')}
    </div>

    <!-- Actions -->
    <div class="topbar-actions">
      <!-- Cmd+K search -->
      <button class="topbar-btn topbar-search-btn" id="topbar-search-btn" title="Search (Cmd+K)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span class="topbar-search-hint">Cmd+K</span>
      </button>

      <!-- Bell / notifications -->
      <button class="topbar-btn topbar-bell" id="topbar-bell" title="Notifications" onclick="toggleNotificationPanel()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="topbar-badge" id="notif-badge" style="display:none">0</span>
      </button>

      <!-- User avatar -->
      <div class="topbar-user" id="topbar-user" onclick="toggleUserMenu()">
        <div class="topbar-avatar">JK</div>
        <div class="topbar-user-info">
          <span class="topbar-username">J. Kamau</span>
          <span class="topbar-role-label" id="topbar-role-label">HQ Commercial</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <!-- User dropdown -->
      <div class="user-dropdown" id="user-dropdown" style="display:none">
        <div class="user-dropdown-header">
          <div class="topbar-avatar lg">JK</div>
          <div>
            <div class="font-600">J. Kamau</div>
            <div class="text-mid text-sm">j.kamau@rwandair.com</div>
          </div>
        </div>
        <hr class="dropdown-div">
        <button class="dropdown-item" onclick="window.location.hash='reports'">My Reports</button>
        <button class="dropdown-item" onclick="showPrefsModal()">Preferences</button>
        <hr class="dropdown-div">
        <button class="dropdown-item dropdown-item-danger" onclick="handleLogout()">Sign Out</button>
      </div>
    </div>
  </div>
  `;
}

// ── Global functions ──────────────────────────────────────────────

window.setRole = function(roleId) {
  _currentRole = roleId;
  const role = ROLES.find(r => r.id === roleId);

  // Update tab UI
  document.querySelectorAll('.role-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === roleId);
  });

  // Update role label in user menu
  const lbl = document.getElementById('topbar-role-label');
  if (lbl && role) lbl.textContent = role.label;

  showToast(`Viewing as: ${role?.label || roleId}`, 'info', 'Dashboard updated for this role', 2500);
};

window.toggleUserMenu = function() {
  const menu = document.getElementById('user-dropdown');
  if (!menu) return;
  const isOpen = menu.style.display !== 'none';
  menu.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!document.getElementById('topbar-user')?.contains(e.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 0);
  }
};

window.handleLogout = function() {
  showToast('Signing out…', 'info', '', 1500);
  setTimeout(() => {
    document.getElementById('app').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:var(--smoke)">
        <div style="text-align:center">
          <div class="wb-logo-mark" style="margin:0 auto 16px;width:56px;height:56px;font-size:20px">
            <span class="wb-text">WB</span>
          </div>
          <h2 style="color:var(--navy)">RwandAir Cargo Intelligence Portal</h2>
          <p style="color:var(--mid);margin-top:8px">You have been signed out.</p>
          <button class="btn btn-pri" style="margin-top:24px" onclick="window.location.reload()">Sign In Again</button>
        </div>
      </div>`;
  }, 1600);
};

window.showPrefsModal = function() {
  showToast('Preferences panel coming soon', 'info', 'Use keyboard shortcuts: ? for help', 3000);
};

window.toggleNotificationPanel = function() {
  // Delegate to notification component
  document.dispatchEvent(new CustomEvent('toggle-notifications'));
};

// Open command palette from topbar button
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('topbar-search-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      import('./command-palette.js').then(m => m.openPalette());
    });
  }
});
