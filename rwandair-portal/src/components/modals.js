// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Modal System
// Multi-step New Booking modal (4 steps) + generic modal helpers
// ═══════════════════════════════════════════════════════════════════

import { showToast } from './toast.js';
import { STATIONS } from '../data/stations.js';
import { FLIGHTS } from '../data/flights.js';
import { RATE_CARDS, CARGO_TYPES, AWB_PREFIX, calculateCharge, getRate } from '../data/rates.js';

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

/* Capture form values from DOM before navigation (fixes onchange-not-fired bug) */
function _captureCurrentStepValues() {
  if (_bookingStep === 1) {
    const o = document.getElementById('bk-origin');
    const d = document.getElementById('bk-dest');
    const dt = document.getElementById('bk-date');
    const f = document.getElementById('bk-flight');
    if (o) _bookingData.origin = o.value;
    if (d) _bookingData.destination = d.value;
    if (dt) _bookingData.date = dt.value;
    if (f) _bookingData.flight = f.value;
  } else if (_bookingStep === 2) {
    const ct = document.getElementById('bk-cargo');
    const pc = document.getElementById('bk-pieces');
    const wt = document.getElementById('bk-weight');
    const cb = document.getElementById('bk-cbm');
    const cm = document.getElementById('bk-commodity');
    const sh = document.getElementById('bk-shc');
    if (ct) _bookingData.cargoType = ct.value;
    if (pc) _bookingData.pieces = pc.value;
    if (wt) _bookingData.weight = wt.value;
    if (cb) _bookingData.cbm = cb.value;
    if (cm) _bookingData.commodity = cm.value;
    if (sh) _bookingData.shc = sh.value;
  } else if (_bookingStep === 3) {
    const fields = [
      ['bk-shipperName','shipperName'], ['bk-shipperAcct','shipperAcct'],
      ['bk-shipperPhone','shipperPhone'], ['bk-shipperEmail','shipperEmail'],
      ['bk-consigneeName','consigneeName'], ['bk-consigneePhone','consigneePhone'],
    ];
    fields.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) _bookingData[key] = el.value;
    });
  }
}

/* Restore form values after re-render (fixes Back-button data loss) */
function _restoreFormValues() {
  setTimeout(() => {
    if (_bookingStep === 1) {
      const map = { 'bk-origin':'origin', 'bk-dest':'destination', 'bk-date':'date', 'bk-flight':'flight' };
      Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && _bookingData[key]) el.value = _bookingData[key];
      });
    } else if (_bookingStep === 2) {
      const map = { 'bk-cargo':'cargoType', 'bk-pieces':'pieces', 'bk-weight':'weight',
                     'bk-cbm':'cbm', 'bk-commodity':'commodity', 'bk-shc':'shc' };
      Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && _bookingData[key]) el.value = _bookingData[key];
      });
    } else if (_bookingStep === 3) {
      const map = { 'bk-shipperName':'shipperName', 'bk-shipperAcct':'shipperAcct',
                     'bk-shipperPhone':'shipperPhone', 'bk-shipperEmail':'shipperEmail',
                     'bk-consigneeName':'consigneeName', 'bk-consigneePhone':'consigneePhone' };
      Object.entries(map).forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el && _bookingData[key]) el.value = _bookingData[key];
      });
    }
  }, 0);
}

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
        <input type="date" class="form-control" id="bk-date" value="${_bookingData.date || '2026-03-12'}" onchange="updateBookingData('date',this.value)">
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
        <input type="number" class="form-control" id="bk-pieces" min="1" placeholder="e.g. 4" oninput="updateBookingData('pieces',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Gross Weight (kg) *</label>
        <input type="number" class="form-control" id="bk-weight" min="0.1" step="0.1" placeholder="e.g. 250" oninput="updateBookingData('weight',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Volume (CBM)</label>
        <input type="number" class="form-control" id="bk-cbm" min="0" step="0.01" placeholder="e.g. 1.5" oninput="updateBookingData('cbm',this.value)">
      </div>
      <div class="form-group span-2">
        <label class="form-label">Commodity Description *</label>
        <input type="text" class="form-control" id="bk-commodity" placeholder="e.g. Electronic components — laptops" oninput="updateBookingData('commodity',this.value)">
      </div>
      <div class="form-group span-2">
        <label class="form-label">Special Handling Codes</label>
        <input type="text" class="form-control" id="bk-shc" placeholder="e.g. PIL, COL, VAL" oninput="updateBookingData('shc',this.value)">
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
        <input type="text" class="form-control" id="bk-shipperName" placeholder="Shipper company name" oninput="updateBookingData('shipperName',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Account / IATA Code</label>
        <input type="text" class="form-control" id="bk-shipperAcct" placeholder="e.g. GS0002" oninput="updateBookingData('shipperAcct',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Phone</label>
        <input type="tel" class="form-control" id="bk-shipperPhone" placeholder="+971 4 282 9000" oninput="updateBookingData('shipperPhone',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Email</label>
        <input type="email" class="form-control" id="bk-shipperEmail" placeholder="cargo@example.com" oninput="updateBookingData('shipperEmail',this.value)">
      </div>
      <div class="form-group span-2" style="margin-top:12px">
        <label class="form-label" style="font-weight:700;color:var(--navy)">Consignee</label>
      </div>
      <div class="form-group">
        <label class="form-label">Company Name *</label>
        <input type="text" class="form-control" id="bk-consigneeName" placeholder="Consignee company name" oninput="updateBookingData('consigneeName',this.value)">
      </div>
      <div class="form-group">
        <label class="form-label">Contact Phone</label>
        <input type="tel" class="form-control" id="bk-consigneePhone" placeholder="+44 20 8745 7777" oninput="updateBookingData('consigneePhone',this.value)">
      </div>
    </div>`;
  } else if (_bookingStep === 4) {
    // Generate AWB: always exactly 8 digits after prefix
    const awb = `${AWB_PREFIX}-${Math.floor(10000000 + Math.random() * 89999999)}`;
    _bookingData.awb = awb;

    const d = _bookingData;
    const weight = parseFloat(d.weight) || 0;
    const cbm = parseFloat(d.cbm) || 0;
    const routeId = `${d.origin}-${d.destination}`;

    // Use the proper calculateCharge() from rates.js with fallback
    let charges = calculateCharge(routeId, weight, cbm);
    if (!charges) {
      // Fallback: try to find a rate by origin/destination
      const foundRate = getRate(d.origin, d.destination);
      if (foundRate) {
        charges = calculateCharge(foundRate.id, weight, cbm);
      }
    }
    if (!charges) {
      // Final fallback with default rates
      const freight = weight * 3.50;
      const fuel = freight * 0.21;
      const security = weight * 0.10;
      charges = {
        baseRate: 3.50, chargeableKg: weight, freight: Math.round(freight * 100) / 100,
        fuelSurch: Math.round(fuel * 100) / 100, secSurch: Math.round(security * 100) / 100,
        awbFee: 15, total: Math.round((freight + fuel + security + 15) * 100) / 100,
        volumetricUsed: false
      };
    }

    const volNote = charges.volumetricUsed
      ? `<div class="review-row" style="color:var(--amber)"><span>Volumetric weight used</span><strong>${charges.chargeableKg} kg</strong></div>`
      : '';

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
        <div class="review-row"><span>Gross Weight</span><strong>${d.weight || 0} kg</strong></div>
        ${volNote}
        <div class="review-row"><span>Commodity</span><strong>${d.commodity || '—'}</strong></div>
        <div class="review-row"><span>Shipper</span><strong>${d.shipperName || '—'}</strong></div>
        <div class="review-row"><span>Consignee</span><strong>${d.consigneeName || '—'}</strong></div>
      </div>
      <div class="review-section">
        <h4 class="review-section-title">Charges</h4>
        <div class="review-row"><span>Freight ($${charges.baseRate}/kg × ${charges.chargeableKg}kg)</span><strong>$${charges.freight.toFixed(2)}</strong></div>
        <div class="review-row"><span>Fuel Surcharge</span><strong>$${charges.fuelSurch.toFixed(2)}</strong></div>
        <div class="review-row"><span>Security Surcharge</span><strong>$${charges.secSurch.toFixed(2)}</strong></div>
        <div class="review-row"><span>AWB Fee</span><strong>$${charges.awbFee.toFixed(2)}</strong></div>
        <div class="review-row review-total"><span>Total</span><strong>$${charges.total.toFixed(2)}</strong></div>
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
  <div class="modal-backdrop" onclick="closeModal()"></div>
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

  // Restore previously entered values when navigating Back
  _restoreFormValues();
}

window.updateBookingData = function(key, value) {
  _bookingData[key] = value;
};

window.bookingNext = function() {
  // Capture values from DOM first (fixes oninput timing edge case)
  _captureCurrentStepValues();

  if (_bookingStep === 1 && (!_bookingData.origin || !_bookingData.destination)) {
    showToast('Please select origin and destination', 'warning');
    return;
  }
  if (_bookingStep === 2 && (!_bookingData.weight || !_bookingData.cargoType)) {
    showToast('Please enter cargo type and weight', 'warning');
    return;
  }
  if (_bookingStep === 3 && (!_bookingData.shipperName || !_bookingData.consigneeName)) {
    showToast('Please enter shipper and consignee company names', 'warning');
    return;
  }
  _bookingStep = Math.min(4, _bookingStep + 1);
  _renderBookingModal();
};

window.bookingPrev = function() {
  // Capture current step values before navigating back
  _captureCurrentStepValues();
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

// ── Late acceptance form (from outbound.js) ───────────────────────

window.showLateAccForm = function() {
  openModal('Late Acceptance Request', `
    <div class="form-grid">
      <div class="form-group"><label class="form-label">AWB *</label>
        <input type="text" class="form-control" id="la-awb" placeholder="459-XXXXXXXX"></div>
      <div class="form-group"><label class="form-label">Flight *</label>
        <select class="form-control" id="la-flight">
          <option value="WB710">WB710 KGL→LHR</option>
          <option value="WB700">WB700 KGL→CDG</option>
          <option value="WB622">WB622 KGL→DXB</option>
        </select></div>
      <div class="form-group"><label class="form-label">Weight (kg) *</label>
        <input type="number" class="form-control" id="la-weight" placeholder="kg"></div>
      <div class="form-group"><label class="form-label">Commodity</label>
        <input type="text" class="form-control" id="la-commodity" placeholder="e.g. Perishables"></div>
      <div class="form-group span-2"><label class="form-label">Reason</label>
        <textarea class="form-control" id="la-reason" rows="2" placeholder="Late delivery from shipper…"></textarea></div>
    </div>`,
    `<button class="btn btn-sec" onclick="closeModal()">Cancel</button>
     <button class="btn btn-pri" onclick="submitLateAcc()">Submit Request</button>`
  );
};

window.submitLateAcc = function() {
  closeModal();
  showToast('Late acceptance request submitted', 'warning', 'Pending approval from Station Manager', 5000);
};
