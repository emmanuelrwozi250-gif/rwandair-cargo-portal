// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Notification Panel Component
// Auto-generates new notifications every 45 seconds
// ═══════════════════════════════════════════════════════════════════

import { NOTIFICATIONS } from '../data/notifications.js';
import { formatDate } from '../utils/format.js';
import { showToast } from './toast.js';

// Session state — clone the base data
const _state = {
  items: NOTIFICATIONS.map(n => ({ ...n })),
  panelOpen: false,
};

const AUTO_NOTIFICATIONS = [
  { type:'BOOKING', title:'New Booking — DXB→KGL', message:'AWB 459-64810293 DXB→KGL 220kg GEN. AL RAIS CARGO.', station:'DXB', severity:'info', link:'#bookings' },
  { type:'ALERT', title:'Capacity Warning — WB204', message:'WB204 NBO→LHR now at 98% belly capacity. Final acceptance window 90min.', station:'NBO', severity:'warning', link:'#outbound' },
  { type:'DWELL', title:'Dwell Alert — NBO', message:'AWB 459-64813401 exceeded 36hr SLA at Nairobi. 38hr 45min.', station:'NBO', severity:'warning', link:'#dwell-alerts' },
  { type:'INFO', title:'WB9316 Landed — DWC', message:'WB9316 landed DWC 14:38 local. Cargo offloaded — 1,840kg delivered to warehouse.', station:'DWC', severity:'info', link:'#inbound' },
  { type:'ALERT', title:'DG Accept Required — WB710', message:'DG shipment AWB 459-64815720 awaiting acceptance sign-off for WB710. Cutoff 18:30.', station:'KGL', severity:'critical', link:'#dangerous-goods' },
];

let _autoIdx = 0;
let _panelEl = null;

// ── Initialise ────────────────────────────────────────────────────

export function initNotifications() {
  _updateBadge();

  // Create panel container
  _panelEl = document.createElement('div');
  _panelEl.id = 'notif-panel';
  _panelEl.className = 'notif-panel';
  _panelEl.style.display = 'none';
  _panelEl.innerHTML = _renderPanel();
  document.body.appendChild(_panelEl);

  // Toggle event from topbar
  document.addEventListener('toggle-notifications', () => {
    _state.panelOpen ? _closePanel() : _openPanel();
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (_state.panelOpen && !_panelEl.contains(e.target) && e.target.id !== 'topbar-bell') {
      _closePanel();
    }
  });

  // Auto-generate a new notification every 45 seconds
  setInterval(() => {
    const base = AUTO_NOTIFICATIONS[_autoIdx % AUTO_NOTIFICATIONS.length];
    _autoIdx++;
    const newNotif = {
      ...base,
      id: Date.now(),
      time: new Date().toISOString(),
      read: false,
    };
    _state.items.unshift(newNotif);
    _updateBadge();
    showToast(newNotif.title, newNotif.severity === 'critical' ? 'error' : newNotif.severity === 'warning' ? 'warning' : 'info', newNotif.message.slice(0, 60) + '…', 5000);
    if (_state.panelOpen) _refreshPanel();
  }, 45000);
}

// ── Open / close ──────────────────────────────────────────────────

function _openPanel() {
  _state.panelOpen = true;
  _panelEl.innerHTML = _renderPanel();
  _panelEl.style.display = 'block';
  requestAnimationFrame(() => _panelEl.classList.add('open'));
}

function _closePanel() {
  _state.panelOpen = false;
  _panelEl.classList.remove('open');
  setTimeout(() => { _panelEl.style.display = 'none'; }, 250);
}

function _refreshPanel() {
  if (_state.panelOpen) {
    _panelEl.innerHTML = _renderPanel();
  }
}

// ── Render ────────────────────────────────────────────────────────

function _renderPanel() {
  const unread = _state.items.filter(n => !n.read).length;
  const items = _state.items.slice(0, 20);

  return `
  <div class="notif-header">
    <div class="notif-title">Notifications ${unread > 0 ? `<span class="notif-count">${unread}</span>` : ''}</div>
    <div class="notif-actions">
      <button class="btn-link" onclick="markAllRead()">Mark all read</button>
      <button class="topbar-btn" onclick="closeNotifPanel()" style="padding:4px 6px">✕</button>
    </div>
  </div>
  <div class="notif-list">
    ${items.length === 0
      ? '<div class="notif-empty">No notifications</div>'
      : items.map(n => _renderItem(n)).join('')
    }
  </div>
  `;
}

function _renderItem(n) {
  const sev = { critical: 'var(--red)', warning: 'var(--amber)', info: 'var(--teal)' };
  const icons = {
    DWELL: '⏰', BOOKING: '📋', ALERT: '⚠', INFO: 'ℹ',
    UPLIFT: '✈', OFFLOAD: '⚠', DELIVERY: '✓', DWELL_WARNING: '⏰',
    DWELL_CRITICAL: '🔴', CUSTOMS_CLEARED: '🛡', TEMP_EXCURSION: '🌡',
  };
  const color = sev[n.severity] || 'var(--teal)';
  const icon = icons[n.type] || 'ℹ';

  return `
  <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="markRead(${n.id})" style="cursor:pointer">
    <div class="notif-icon-wrap" style="background:${color}20;color:${color}">${icon}</div>
    <div class="notif-item-body">
      <div class="notif-item-title">${n.title}</div>
      <div class="notif-item-msg">${n.message}</div>
      <div class="notif-item-meta">
        <span class="notif-station">${n.station}</span>
        <span>${formatDate(n.time, 'rel')}</span>
      </div>
    </div>
    ${!n.read ? '<div class="notif-dot"></div>' : ''}
  </div>`;
}

function _updateBadge() {
  const badge = document.getElementById('notif-badge');
  const unread = _state.items.filter(n => !n.read).length;
  if (!badge) return;
  if (unread > 0) {
    badge.style.display = 'flex';
    badge.textContent = unread > 99 ? '99+' : unread;
  } else {
    badge.style.display = 'none';
  }
}

// ── Global handlers ───────────────────────────────────────────────

window.markRead = function(id) {
  const item = _state.items.find(n => n.id === id);
  if (item) item.read = true;
  _updateBadge();
  _refreshPanel();
};

window.markAllRead = function() {
  _state.items.forEach(n => n.read = true);
  _updateBadge();
  _refreshPanel();
  showToast('All notifications marked as read', 'success', '', 2500);
};

window.closeNotifPanel = function() {
  _closePanel();
};

// ── Public API for alert engine ──────────────────────────────────

/** Add a notification from the alert engine */
window.addCargoNotification = function(notif) {
  _state.items.unshift({
    ...notif,
    id: notif.id || Date.now() + Math.random(),
    time: notif.time || new Date().toISOString(),
    read: false,
  });
  // Keep max 50 notifications
  if (_state.items.length > 50) _state.items.length = 50;
  _updateBadge();
  if (_state.panelOpen) _refreshPanel();
};
