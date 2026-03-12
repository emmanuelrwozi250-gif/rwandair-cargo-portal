// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Outbound Flights Page
// 6 departure cards with cutoff countdown timer, close flight action
// ═══════════════════════════════════════════════════════════════════

import { formatNumber, esc } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';
import { getFlightStaff, staffBadgesHtml } from '../data/staff.js';

// Today's outbound flights from KGL hub
const OUTBOUND_FLIGHTS = [
  { flight:'WB710', origin:'KGL', dest:'LHR', aircraft:'A330-200', std:'22:40', cutoff:'18:30', status:'Open', cargo:6200, capacity:14000, awbs:24, closed:false },
  { flight:'WB700', origin:'KGL', dest:'CDG', aircraft:'A330-200', std:'00:05', cutoff:'20:30', status:'Open', cargo:3840, capacity:14000, awbs:15, closed:false },
  { flight:'WB622', origin:'KGL', dest:'DXB', aircraft:'B737-800', std:'21:15', cutoff:'17:00', status:'Cutoff Passed', cargo:4100, capacity:4500, awbs:31, closed:false },
  { flight:'WB202', origin:'KGL', dest:'NBO', aircraft:'B737-800', std:'07:30', cutoff:'06:00', status:'Closed', cargo:1820, capacity:4500, awbs:12, closed:true },
  { flight:'WB9316', origin:'KGL', dest:'DWC', aircraft:'B737-800', std:'09:45', cutoff:'08:15', status:'Closed', cargo:3650, capacity:4500, awbs:22, closed:true },
  { flight:'WB304', origin:'KGL', dest:'ADD', aircraft:'B737-800', std:'14:00', cutoff:'12:30', status:'Open', cargo:980, capacity:4500, awbs:8, closed:false },
];

const BASE_TIME = new Date('2026-03-11T14:00:00');
let _countdownInterval = null;
let _lateAccModal = false;

export function render() {
  const openFlights = OUTBOUND_FLIGHTS.filter(f => !f.closed && f.status !== 'Cutoff Passed').length;
  const totalCargo = OUTBOUND_FLIGHTS.reduce((s, f) => s + f.cargo, 0);
  const avgLoad = Math.round(OUTBOUND_FLIGHTS.reduce((s, f) => s + (f.cargo / f.capacity * 100), 0) / OUTBOUND_FLIGHTS.length);

  const nearCap = OUTBOUND_FLIGHTS.filter(f => f.cargo/f.capacity > 0.9).length;
  return `
  <div class="page-wrap">

  <div class="portal-header-bar">
    <div class="portal-header-left">
      <span class="portal-header-icon">${icon('plane-out', 18)}</span>
      <div>
        <div class="portal-header-title">Outbound Flights</div>
        <div class="portal-header-sub">11 Mar 2026 · ${OUTBOUND_FLIGHTS.length} departures from KGL hub</div>
      </div>
    </div>
    <div class="portal-header-right">
      <button class="btn btn-ghost btn-sm" onclick="showLateAccForm()">
        ${icon('clock', 13)} Late Acceptance
      </button>
      <button class="btn btn-sec btn-sm" onclick="showToast('Load plan exported','success','ULD load plan PDF ready',3000)">
        ${icon('download', 13)} Load Plan
      </button>
    </div>
  </div>

  <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi-card kpi-green">
      <div class="kpi-label">${icon('check-circle',11)} Open for Booking</div>
      <div class="kpi-value kpi-sm">${openFlights}</div>
    </div>
    <div class="kpi-card kpi-navy">
      <div class="kpi-label">${icon('package',11)} kg Booked</div>
      <div class="kpi-value kpi-sm">${formatNumber(totalCargo)}</div>
    </div>
    <div class="kpi-card kpi-teal">
      <div class="kpi-label">${icon('percent',11)} Avg Load Factor</div>
      <div class="kpi-value kpi-sm">${avgLoad}%</div>
    </div>
    <div class="kpi-card ${nearCap>0?'kpi-amber':'kpi-teal'}">
      <div class="kpi-label">${icon('alert-triangle',11)} Near Capacity &gt;90%</div>
      <div class="kpi-value kpi-sm">${nearCap}</div>
    </div>
  </div>

  <div class="outbound-cards" id="outbound-cards">
    ${OUTBOUND_FLIGHTS.map(f => _renderCard(f)).join('')}
  </div>

  </div>`;
}

function _renderCard(f) {
  const loadPct = Math.round((f.cargo / f.capacity) * 100);
  const loadColor = loadPct > 95 ? 'var(--red)' : loadPct > 80 ? 'var(--amber)' : 'var(--green)';

  const statusColors = {
    'Open': 'var(--green)', 'Closed': 'var(--mid)',
    'Cutoff Passed': 'var(--amber)', 'Delayed': 'var(--red)'
  };
  const sc = statusColors[f.status] || 'var(--mid)';

  // Calculate time to cutoff
  const [ch, cm] = f.cutoff.split(':').map(Number);
  const cutoffDt = new Date('2026-03-11');
  cutoffDt.setHours(ch, cm, 0, 0);
  const msLeft = cutoffDt.getTime() - BASE_TIME.getTime();
  const hLeft = Math.floor(Math.abs(msLeft) / 3600000);
  const mLeft = Math.floor((Math.abs(msLeft) % 3600000) / 60000);
  const isPast = msLeft < 0;

  return `
  <div class="flight-card outbound-card ${f.closed ? 'closed' : ''}">
    <div class="outbound-card-main">
      <div class="outbound-flight-info">
        <div class="flight-number mono">${f.flight}</div>
        <div class="flight-route">${f.origin} → ${f.dest}</div>
        <div class="text-mid text-sm">${f.aircraft}</div>
      </div>
      <div class="outbound-times">
        <div class="outbound-time-block">
          <div class="time-label">STD</div>
          <div class="time-value">${f.std}</div>
        </div>
        <div class="outbound-time-block">
          <div class="time-label">Cutoff</div>
          <div class="time-value">${f.cutoff}</div>
        </div>
        <div class="outbound-time-block cutoff-countdown">
          <div class="time-label">Time to Cutoff</div>
          <div class="time-value ${isPast ? 'past' : ''}" id="countdown-${f.flight}">
            ${isPast ? `<span style="color:var(--red)">Past</span>` : `${hLeft}h ${mLeft}m`}
          </div>
        </div>
      </div>
      <div class="outbound-load">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span class="text-sm text-mid">Load Factor</span>
          <span class="text-sm" style="color:${loadColor};font-weight:700">${loadPct}%</span>
        </div>
        <div class="load-bar-track">
          <div class="load-bar-fill" style="width:${loadPct}%;background:${loadColor}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span class="text-sm text-mid">${formatNumber(f.cargo)} kg</span>
          <span class="text-sm text-mid">of ${formatNumber(f.capacity)} kg</span>
        </div>
      </div>
      <div class="outbound-stats">
        <div class="flight-stat"><span class="stat-label">AWBs</span><span>${f.awbs}</span></div>
        <div class="flight-stat">
          <span class="stat-label">Status</span>
          <span class="badge" style="background:${sc}20;color:${sc}">${f.status}</span>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:6px;max-height:48px;overflow:hidden">${staffBadgesHtml(getFlightStaff(f.flight))}</div>
      <div class="outbound-actions">
        ${!f.closed && f.status !== 'Cutoff Passed'
          ? `<button class="btn btn-sec btn-sm" onclick="showToast('Cargo list printed','info','','2000')">Print Cargo List</button>
             <button class="btn btn-danger btn-sm" onclick="closeFlight('${f.flight}')">Close Flight</button>`
          : `<button class="btn btn-sec btn-sm" onclick="showToast('Report for ${f.flight} opened','info')">View Report</button>`
        }
        <button class="btn btn-sec btn-sm" onclick="showToast('Load plan for ${f.flight}','info','ULD configuration displayed','3000')">Load Plan</button>
      </div>
    </div>
  </div>`;
}

export function init() {
  // Live countdown every 30s
  if (_countdownInterval) clearInterval(_countdownInterval);
  _countdownInterval = setInterval(() => {
    OUTBOUND_FLIGHTS.forEach(f => {
      const el = document.getElementById(`countdown-${f.flight}`);
      if (!el) return;
      const [ch, cm] = f.cutoff.split(':').map(Number);
      const cutoffDt = new Date('2026-03-11');
      cutoffDt.setHours(ch, cm, 0, 0);
      const now = new Date();
      const msLeft = cutoffDt.getTime() - now.getTime();
      if (msLeft < 0) {
        el.innerHTML = `<span style="color:var(--red)">Past</span>`;
      } else {
        const h = Math.floor(msLeft / 3600000);
        const m = Math.floor((msLeft % 3600000) / 60000);
        el.textContent = `${h}h ${m}m`;
        if (h === 0 && m < 30) el.style.color = 'var(--amber)';
        if (h === 0 && m < 15) el.style.color = 'var(--red)';
      }
    });
  }, 30000);
}

window.closeFlight = function(flight) {
  const f = OUTBOUND_FLIGHTS.find(fl => fl.flight === flight);
  if (!f) return;
  f.closed = true;
  f.status = 'Closed';
  const cards = document.getElementById('outbound-cards');
  if (cards) cards.innerHTML = OUTBOUND_FLIGHTS.map(fl => _renderCard(fl)).join('');
  showToast(`Flight ${flight} closed`, 'success', 'No further bookings accepted. Load plan finalised.', 4000);
};

window.showLateAccForm = function() {
  import('../components/modals.js').then(m => {
    m.openModal('Late Acceptance Request',
      `<div class="form-grid">
        <div class="form-group"><label class="form-label">AWB</label><input type="text" class="form-control" placeholder="459-XXXXXXXX"></div>
        <div class="form-group"><label class="form-label">Flight</label>
          <select class="form-control">
            ${OUTBOUND_FLIGHTS.map(f => `<option value="${f.flight}">${f.flight} KGL→${f.dest} ${f.std}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label class="form-label">Weight (kg)</label><input type="number" class="form-control" placeholder="380"></div>
        <div class="form-group"><label class="form-label">Commodity</label><input type="text" class="form-control" placeholder="Electronics"></div>
        <div class="form-group span-2"><label class="form-label">Reason for Late Acceptance</label><textarea class="form-control" rows="2" placeholder="Explain reason for exceeding cutoff..."></textarea></div>
      </div>`,
      `<button class="btn btn-sec" onclick="closeModal()">Cancel</button>
       <button class="btn btn-pri" onclick="submitLateAcc()">Submit for Approval</button>`
    );
  });
};

window.submitLateAcc = function() {
  window.closeModal();
  showToast('Late acceptance submitted', 'warning', 'Pending approval from Station Manager', 5000);
};

export const handler = { render, init };
