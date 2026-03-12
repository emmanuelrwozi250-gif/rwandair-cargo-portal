// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Inbound Flights Page
// 6 flight cards with manifests, pre-arrival checklists
// ═══════════════════════════════════════════════════════════════════

import { FLIGHTS } from '../data/flights.js';
import { formatDate, formatNumber, esc } from '../utils/format.js';
import { getChecklist, setChecklist } from '../utils/storage.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';
import { getFlightStaff, staffBadgesHtml } from '../data/staff.js';

// Today's inbound flights (arriving 11 Mar 2026)
const INBOUND_FLIGHTS = [
  { flight:'WB711', origin:'LHR', dest:'KGL', aircraft:'A330-200', sta:'07:30', status:'Landed', cargo:4820, awbs:18, pax:312 },
  { flight:'WB701', origin:'CDG', dest:'KGL', aircraft:'A330-200', sta:'09:15', status:'On Approach', cargo:2140, awbs:9, pax:278 },
  { flight:'WB201', origin:'NBO', dest:'KGL', aircraft:'B737-800', sta:'10:45', status:'Airborne', cargo:1380, awbs:14, pax:162 },
  { flight:'WB9317', origin:'DWC', dest:'KGL', aircraft:'B737-800', sta:'13:20', status:'Scheduled', cargo:3650, awbs:22, pax:0 },
  { flight:'WB305', origin:'JNB', dest:'KGL', aircraft:'B737-800', sta:'15:40', status:'Scheduled', cargo:1920, awbs:11, pax:148 },
  { flight:'WB107', origin:'LOS', dest:'NBO', aircraft:'A330-200', sta:'16:55', status:'Delayed', cargo:5400, awbs:27, pax:301, delay:'+45min' },
];

const MANIFEST_DATA = {
  WB711: [
    { awb:'459-66271704', shipper:'PharmaCorp UK', dest:'KGL', pieces:4, weight:320, shc:'PIL', status:'Arrived' },
    { awb:'459-64810293', shipper:'AL RAIS CARGO', dest:'KGL', pieces:8, weight:420, shc:'GEN', status:'Arrived' },
    { awb:'459-64801122', shipper:'Tesco PLC', dest:'KGL', pieces:12, weight:890, shc:'GEN', status:'Arrived' },
    { awb:'459-64802233', shipper:'London Medical', dest:'KGL', pieces:3, weight:95, shc:'PIL', status:'Arrived' },
    { awb:'459-64803344', shipper:'British Airways Cargo', dest:'EBB', pieces:6, weight:340, shc:'GEN', status:'Transit' },
  ],
  WB701: [
    { awb:'459-64811455', shipper:'Air France Cargo', dest:'KGL', pieces:5, weight:280, shc:'GEN', status:'Arriving' },
    { awb:'459-64812566', shipper:'Paris Fashion House', dest:'KGL', pieces:2, weight:48, shc:'VAL', status:'Arriving' },
    { awb:'459-64813677', shipper:'CDG Medical Supplies', dest:'NBO', pieces:8, weight:640, shc:'PIL', status:'Transit' },
  ],
};

const CHECKLIST_ITEMS = [
  'Customs pre-alert sent',
  'Cool room pre-conditioned',
  'Ground handler briefed',
  'Security escort arranged',
  'NOTOC reviewed',
  'DG acceptance complete',
  'Truck/transport confirmed',
];

let _activeCard = null;

export function render() {
  const totalCargo = INBOUND_FLIGHTS.reduce((s, f) => s + f.cargo, 0);
  const landed = INBOUND_FLIGHTS.filter(f => f.status === 'Landed').length;
  const delayed = INBOUND_FLIGHTS.filter(f => f.status === 'Delayed').length;

  return `
  <div class="page-wrap">

  <div class="portal-header-bar">
    <div class="portal-header-left">
      <span class="portal-header-icon">${icon('plane-in', 18)}</span>
      <div>
        <div class="portal-header-title">Inbound Flights</div>
        <div class="portal-header-sub">11 Mar 2026 · ${INBOUND_FLIGHTS.length} arrivals · ${formatNumber(totalCargo)} kg inbound cargo</div>
      </div>
    </div>
    <div class="portal-header-right">
      <span class="badge-live">${icon('activity',12)} Live</span>
      <button class="btn btn-ghost btn-sm" onclick="showToast('Arrival report exported','success','PDF generated',3000)">
        ${icon('file-text',13)} Arrival Report
      </button>
    </div>
  </div>

  <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">
    <div class="kpi-card kpi-navy">
      <div class="kpi-label">${icon('plane-in',11)} Arrivals Today</div>
      <div class="kpi-value kpi-sm">${INBOUND_FLIGHTS.length}</div>
    </div>
    <div class="kpi-card kpi-green">
      <div class="kpi-label">${icon('check-circle',11)} Landed</div>
      <div class="kpi-value kpi-sm">${landed}</div>
    </div>
    <div class="kpi-card ${delayed>0?'kpi-red':'kpi-teal'}">
      <div class="kpi-label">${icon('alert-triangle',11)} Delayed</div>
      <div class="kpi-value kpi-sm">${delayed}</div>
    </div>
    <div class="kpi-card kpi-teal">
      <div class="kpi-label">${icon('package',11)} Total Cargo</div>
      <div class="kpi-value kpi-sm">${formatNumber(totalCargo)} kg</div>
    </div>
  </div>

  <div class="flight-cards-grid" id="inbound-cards">
    ${INBOUND_FLIGHTS.map(f => _renderFlightCard(f)).join('')}
  </div>

  </div>`;
}

function _renderFlightCard(f) {
  const statusColors = {
    'Landed': 'var(--green)', 'On Approach': 'var(--teal)',
    'Airborne': 'var(--navy)', 'Scheduled': 'var(--mid)', 'Delayed': 'var(--red)'
  };
  const sc = statusColors[f.status] || 'var(--mid)';
  const checklist = getChecklist(f.flight);
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const active = _activeCard === f.flight;

  return `
  <div class="flight-card ${active ? 'expanded' : ''}" id="fcard-${f.flight}">
    <div class="flight-card-header" onclick="expandInboundCard('${f.flight}')">
      <div class="flight-card-main">
        <div class="flight-number mono">${f.flight}</div>
        <div class="flight-route">${f.origin} → ${f.dest}</div>
        <div class="flight-aircraft text-mid text-sm">${f.aircraft}</div>
      </div>
      <div class="flight-card-meta">
        <div class="flight-time">STA ${f.sta}</div>
        ${f.delay ? `<div class="text-sm" style="color:var(--red)">${f.delay}</div>` : ''}
        <span class="badge" style="background:${sc}20;color:${sc}">${f.status}</span>
      </div>
      <div class="flight-card-stats">
        <div class="flight-stat"><span class="stat-label">Cargo</span><span>${formatNumber(f.cargo)} kg</span></div>
        <div class="flight-stat"><span class="stat-label">AWBs</span><span>${f.awbs}</span></div>
        <div class="flight-stat"><span class="stat-label">Pre-arrival</span><span style="color:${checkedCount>=5?'var(--green)':checkedCount>=3?'var(--amber)':'var(--red)'}">${checkedCount}/${CHECKLIST_ITEMS.length}</span></div>
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-top:8px">${staffBadgesHtml(getFlightStaff(f.flight))}</div>
    </div>
    ${active ? `
    <div class="flight-card-body">
      <div class="flight-card-tabs">
        <button class="tab-btn active" onclick="inboundSubTab('${f.flight}','manifest')">Manifest</button>
        <button class="tab-btn" onclick="inboundSubTab('${f.flight}','checklist')">Pre-Arrival Checklist</button>
      </div>
      <div id="fcard-body-${f.flight}">
        ${_renderManifest(f)}
      </div>
    </div>` : ''}
  </div>`;
}

function _renderManifest(f) {
  const manifest = MANIFEST_DATA[f.flight] || [];
  if (manifest.length === 0) {
    return `<div class="text-mid" style="padding:16px">Manifest not yet received.</div>`;
  }
  return `<table class="data-table">
    <thead><tr><th>AWB</th><th>Shipper</th><th>Dest</th><th>Pieces</th><th>Weight</th><th>SHC</th><th>Status</th></tr></thead>
    <tbody>${manifest.map(m => `
      <tr>
        <td class="mono text-sm">${esc(m.awb)}</td>
        <td class="text-sm">${esc(m.shipper)}</td>
        <td>${esc(m.dest)}</td>
        <td>${m.pieces}</td>
        <td>${m.weight} kg</td>
        <td><span class="badge-small">${esc(m.shc)}</span></td>
        <td><span class="text-sm" style="color:${m.status==='Arrived'?'var(--green)':m.status==='Transit'?'var(--teal)':'var(--amber)'}">${m.status}</span></td>
      </tr>
    `).join('')}</tbody>
  </table>
  <div style="margin-top:12px;display:flex;gap:8px">
    <button class="btn btn-pri btn-sm" onclick="showToast('Manifest accepted','success','${f.flight} cargo acceptance complete','3000')">Accept All</button>
    <button class="btn btn-sec btn-sm" onclick="showToast('Manifest printed','info','','2000')">Print Manifest</button>
  </div>`;
}

function _renderChecklist(f) {
  const checklist = getChecklist(f.flight);
  return `<div class="checklist-wrap">
    ${CHECKLIST_ITEMS.map((item, i) => `
      <div class="checklist-item">
        <input type="checkbox" id="cl-${f.flight}-${i}"
               ${checklist[item] ? 'checked' : ''}
               onchange="updateChecklist('${f.flight}','${item.replace(/'/g,"\\'") }',this.checked)">
        <label for="cl-${f.flight}-${i}">${item}</label>
      </div>
    `).join('')}
    <button class="btn btn-pri" style="margin-top:12px" onclick="showToast('Checklist saved','success','${f.flight} pre-arrival checklist complete','3000')">Save Checklist</button>
  </div>`;
}

export function init() {}

window.expandInboundCard = function(flight) {
  _activeCard = _activeCard === flight ? null : flight;
  const cards = document.getElementById('inbound-cards');
  if (cards) {
    cards.innerHTML = INBOUND_FLIGHTS.map(f => _renderFlightCard(f)).join('');
  }
};

window.inboundSubTab = function(flight, tab) {
  const body = document.getElementById(`fcard-body-${flight}`);
  if (!body) return;
  // Update tab buttons
  body.closest('.flight-card-body')?.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'manifest') || (i === 1 && tab === 'checklist'));
  });
  const f = INBOUND_FLIGHTS.find(fl => fl.flight === flight);
  if (!f) return;
  body.innerHTML = tab === 'manifest' ? _renderManifest(f) : _renderChecklist(f);
};

window.updateChecklist = function(flight, item, checked) {
  setChecklist(flight, item, checked);
  const checklist = getChecklist(flight);
  const checkedCount = Object.values(checklist).filter(Boolean).length;
  // Update counter in card header
  const card = document.getElementById(`fcard-${flight}`);
  if (card) {
    const statEl = card.querySelector('.flight-card-stats .flight-stat:last-child span:last-child');
    if (statEl) {
      statEl.textContent = `${checkedCount}/${CHECKLIST_ITEMS.length}`;
      statEl.style.color = checkedCount >= 5 ? 'var(--green)' : checkedCount >= 3 ? 'var(--amber)' : 'var(--red)';
    }
  }
};

export const handler = { render, init };
