// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Modal System
// Multi-step New Booking modal (4 steps) + generic modal helpers
// ═══════════════════════════════════════════════════════════════════

import { showToast } from './toast.js';
import { STATIONS } from '../data/stations.js';
import { FLIGHTS } from '../data/flights.js';
import { RATE_CARDS, CARGO_TYPES, AWB_PREFIX } from '../data/rates.js';

let _root = null;
let _bookingStep = 1;
let _bookingData = {};

// ── Initialise ────────────────────────────────────────────────────

export function initModals() {
  _root = document.getElementById('modal-root');

  // Escape key closes any open modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && _root && _root.innerHTML) {
      closeModal();
    }
  });
}

// ── Generic modal helpers ─────────────────────────────────────────

export function openModal(title, content, footer = '') {
  if (!_root) _root = document.getElementById('modal-root');
  _root.innerHTML = `
  <div class="modal-backdrop" onclick="closeModal()"></div>
  <div class="modal-box" role="dialog" aria-modal="true" aria-label="${title}">
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    </div>
    <div class="modal-body">${content}</div>
    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
  </div>`;
  document.body.style.overflow = 'hidden';
}

window.closeModal = function() {
  if (!_root) return;
  _root.innerHTML = '';
  document.body.style.overflow = '';
  _bookingStep = 1;
  _bookingData = {};
};

// ── New Booking Modal ─────────────────────────────────────────────

export function openBookingModal() {
  _bookingStep = 1;
  _bookingData = {};
  _renderBookingModal();
}
window.openBookingModal = openBookingModal;

function _renderBookingModal() {
  if (!_root) _root = document.getElementById('modal-root');

  const stationOptions = STATIONS.map(s => `<option value="${s.code}">${s.code} — ${s.city}</option>`).join('');
  const cargoOptions = CARGO_TYPES.map(c => `<option value="${c.code}">${c.code} — ${c.label}</option>`).join('');

  const steps = [
    { n: 1, label: 'Route & Flight' },
    { n: 2, label: 'Cargo Details' },
    { n: 3, label: 'Shipper & Consignee' },
    { n: 4, label: 'Review & Confirm' },
  ];

  const stepsHtml = `
    <div class="booking-steps">
      ${steps.map(s => `
        <div class="booking-step ${s.n === _bookingStep ? 'active' : s.n < _bookingStep ? 'done' : ''}">
          <div class="step-num">${s.n < _bookingStep ? '✓' : s.n}</div>
          <div class="step-label">${s.label}</div>
        </div>
        ${s.n < 4 ? '<div class="step-connector"></div>' : ''}
      `).join('')}
    </div>`;

  let body = '';

  if (_bookingStep === 1) {
    const todayFlights = FLIGHTS.filter(f => f.origin === 'KGL' || f.origin === 'NBO' || f.origin === 'DXB').slice(0, 8);
    body = `
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Origin *</label>
        <select class="form-control" id="bk-origin" onchange="updateBookingData('origin',this.value)">
          <option value="">Select origin</option>${stationOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Destination *</label>
        <select class="form-control" id="bk-dest" onchange="updateBookingData('destination',this.value)">
          <option value="">Select destination</option>${stationOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Departure Date *</label>
        <input type="date" class="form-control" id="bk-date" value="2026-03-12" onchange="updateBookingData('date',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Flight</label>
        <select class="form-control" id="bk-flight" onchange="updateBookingData('flight',this.value)">
          <option value="">Auto-select best flight</option>
          ${todayFlights.map(f => `<option value="${f.flight}">${f.flight} ${f.origin}→${f.destination} ${f.std}</option>`).join('')}
        </select>
      </div>
    </div>`;
  } else if (_bookingStep === 2) {
    body = `
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Cargo Type *</label>
        <select class="form-control" id="bk-cargo" onchange="updateBookingData('cargoType',this.value)">
          <option value="">Select type</option>${cargoOptions}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Pieces *</label>
        <input type="number" class="form-control" id="bk-pieces" min="1" placeholder="e.g. 4" onchange="updateBookingData('pieces',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Gross Weight (kg) *</label>
        <input type="number" class="form-control" id="bk-weight" min="0.1" step="0.1" placeholder="e.g. 250" onchange="updateBookingData('weight',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Volume (CBM)</label>
        <input type="number" class="form-control" id="bk-cbm" min="0" step="0.01" placeholder="e.g. 1.5" onchange="updateBookingData('cbm',this.value)">
      </div>
      <div class="form-group span-2">
        <label class="form-label">Commodity Description *</label>
        <input type="text" class="form-control" id="bk-commodity" placeholder="e.g. Electronic components — laptops" onchange="updateBookingData('commodity',this.value)">
      </div>
      <div class="form-group span-2">
        <label class="form-label">Special Handling Codes</label>
        <input type="text" class="form-control" id="bk-shc" placeholder="e.g. PIL, COL, VAL" onchange="updateBookingData('shc',this.value)">
      </div>
    </div>`;
  } else if (_bookingStep === 3) {
    body = `
    <div class="form-grid">
      <div class="form-group span-2">
        <label class="form-label" style="font-weight:700;color:var(--navy)">Shipper</label>
      </div>
      <div class="form-group">
        <label class="form-label">Company Name *</label>
        <input type="text" class="form-control" placeholder="Shipper company name" onchange="updateBookingData('shipperName',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Account / IATA Code</label>
        <input type="text" class="form-control" placeholder="e.g. GS0002" onchange="updateBookingData('shipperAcct',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Phone</label>
        <input type="tel" class="form-control" placeholder="+971 4 282 9000" onchange="updateBookingData('shipperPhone',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Email</label>
        <input type="email" class="form-control" placeholder="cargo@example.com" onchange="updateBookingData('shipperEmail',this.value)">
      </div>
      <div class="form-group span-2" style="margin-top:12px">
        <label class="form-label" style="font-weight:700;color:var(--navy)">Consignee</label>
      </div>
      <div class="form-group">
        <label class="form-label">Company Name *</label>
        <input type="text" class="form-control" placeholder="Consignee company name" onchange="updateBookingData('consigneeName',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Phone</label>
        <input type="tel" class="form-control" placeholder="+44 20 8745 7777" onchange="updateBookingData('consigneePhone',this.value)">
      </div>
    </div>`;
  } else if (_bookingStep === 4) {
    // Generate a fake AWB
    const awb = `${AWB_PREFIX}-${Math.floor(60000000 + Math.random() * 9999999)}`;
    _bookingData.awb = awb;

    const d = _bookingData;
    const weight = parseFloat(d.weight) || 0;
    const rate = RATE_CARDS.find(r => r.origin === d.origin && r.destination === d.destination) ||
                 { baseRate: 3.50, fuelSurch: 0.65, secSurch: 0.10, handling: 15 };
    const freight = weight * rate.baseRate;
    const fuel = freight * 0.21;
    const security = weight * 0.10;
    const total = freight + fuel + security + 15;

    body = `
    <div class="review-grid">
      <div class="review-section">
        <h4 class="review-section-title">Route & Flight</h4>
        <div class="review-row"><span>Route</span><strong>${d.origin || '—'} → ${d.destination || '—'}</strong></div>
        <div class="review-row"><span>Date</span><strong>${d.date || '12 Mar 2026'}</strong></div>
        <div class="review-row"><span>Flight</span><strong>${d.flight || 'Auto-selected'}</strong></div>
      </div>
      <div class="review-section">
        <h4 class="review-section-title">Cargo</h4>
        <div class="review-row"><span>Type</span><strong>${d.cargoType || '—'}</strong></div>
        <div class="review-row"><span>Weight</span><strong>${d.weight || 0} kg</strong></div>
        <div class="review-row"><span>Commodity</span><strong>${d.commodity || '—'}</strong></div>
      </div>
      <div class="review-section">
        <h4 class="review-section-title">Charges</h4>
        <div class="review-row"><span>Freight (${rate.baseRate}/kg)</span><strong>$${freight.toFixed(2)}</strong></div>
        <div class="review-row"><span>Fuel Surcharge (21%)</span><strong>$${fuel.toFixed(2)}</strong></div>
        <div class="review-row"><span>Security (0.10/kg)</span><strong>$${security.toFixed(2)}</strong></div>
        <div class="review-row"><span>AWB Fee</span><strong>$15.00</strong></div>
        <div class="review-row review-total"><span>Total</span><strong>$${total.toFixed(2)}</strong></div>
      </div>
      <div class="review-section awb-preview">
        <h4 class="review-section-title">Proposed AWB</h4>
        <div class="awb-number-display">${awb}</div>
        <p class="text-mid text-sm" style="margin-top:8px">AWB will be issued upon confirmation</p>
      </div>
    </div>`;
  }

  const footer = `
    <button class="btn btn-sec" onclick="${_bookingStep > 1 ? 'bookingPrev()' : 'closeModal()'}">
      ${_bookingStep > 1 ? '← Back' : 'Cancel'}
    </button>
    <button class="btn btn-pri" onclick="${_bookingStep < 4 ? 'bookingNext()' : 'confirmBooking()'}">
      ${_bookingStep < 4 ? 'Next →' : 'Confirm Booking'}
    </button>`;

  _root.innerHTML = `
  <div class="modal-backdrop"></div>
  <div class="modal-box modal-lg" role="dialog" aria-modal="true">
    <div class="modal-header">
      <h3 class="modal-title">New Cargo Booking</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    ${stepsHtml}
    <div class="modal-body">${body}</div>
    <div class="modal-footer">${footer}</div>
  </div>`;
  document.body.style.overflow = 'hidden';
}

window.updateBookingData = function(key, value) {
  _bookingData[key] = value;
};

window.bookingNext = function() {
  if (_bookingStep === 1 && (!_bookingData.origin || !_bookingData.destination)) {
    showToast('Please select origin and destination', 'warning');
    return;
  }
  if (_bookingStep === 2 && (!_bookingData.weight || !_bookingData.cargoType)) {
    showToast('Please enter cargo type and weight', 'warning');
    return;
  }
  _bookingStep = Math.min(4, _bookingStep + 1);
  _renderBookingModal();
};

window.bookingPrev = function() {
  _bookingStep = Math.max(1, _bookingStep - 1);
  _renderBookingModal();
};

window.confirmBooking = function() {
  closeModal();
  showToast('Booking confirmed!', 'success', `AWB ${_bookingData.awb} issued. Flight ${_bookingData.flight || 'auto-selected'}.`, 6000);
  _bookingStep = 1;
  _bookingData = {};
};

// ── Shortcuts help modal ──────────────────────────────────────────

window.showShortcutsHelp = function() {
  const shortcuts = [
    ['Cmd+K', 'Open command palette'],
    ['?', 'Show this help'],
    ['N', 'New booking'],
    ['S', 'Toggle sidebar'],
    ['G then S', 'Go to Space Search'],
    ['G then B', 'Go to Bookings'],
    ['G then T', 'Go to Tracking'],
    ['G then W', 'Go to Warehouse'],
    ['G then R', 'Go to Reports'],
    ['Esc', 'Close modal/palette'],
  ];
  openModal('Keyboard Shortcuts',
    `<table class="shortcuts-table">
      <thead><tr><th>Key</th><th>Action</th></tr></thead>
      <tbody>${shortcuts.map(([k, a]) => `<tr><td><kbd>${k}</kbd></td><td>${a}</td></tr>`).join('')}</tbody>
    </table>`,
    '<button class="btn btn-pri" onclick="closeModal()">Got it</button>'
  );
};
