// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Warehouse Page
// 12 transit AWBs, live dwell timer, 4 tabs, expand rows, actions
// ═══════════════════════════════════════════════════════════════════

import { formatDate, formatDwell, esc } from '../utils/format.js';
import { showToast } from '../components/toast.js';

// Mock transit shipments in warehouse
const TRANSIT_AWBS = [
  { awb:'459-66271704', origin:'NBO', destination:'LHR', commodity:'Pharma (PIL)', weight:320, pieces:4, location:'NBO-CoolRoom-A3', status:'Dwell Alert', dwellMin:3080, flight:'WB204', cutoff:'18:30', handler:'East Africa Cargo', temp:'7.2°C', shc:'PIL' },
  { awb:'459-64668321', origin:'ADD', destination:'KGL', commodity:'DG Class 3', weight:185, pieces:2, location:'ADD-DG-Bay-2', status:'Dwell Alert', dwellMin:2340, flight:'WB701', cutoff:'15:00', handler:'Horn of Africa Cargo', temp:null, shc:'RFL' },
  { awb:'459-64791101', origin:'NBO', destination:'LHR', commodity:'Perishables', weight:1240, pieces:18, location:'NBO-CoolRoom-B1', status:'In Transit', dwellMin:1420, flight:'WB204', cutoff:'18:30', handler:'East Africa Cargo', temp:'4.1°C', shc:'COL' },
  { awb:'459-64772050', origin:'KGL', destination:'DXB', commodity:'Electronics', weight:480, pieces:8, location:'KGL-Gen-C4', status:'In Transit', dwellMin:920, flight:'WB622', cutoff:'20:00', handler:'RwandAir Direct', temp:null, shc:'ELI' },
  { awb:'459-64809765', origin:'DWC', destination:'KGL', commodity:'General Cargo', weight:45, pieces:1, location:'DWC-Gen-A12', status:'In Transit', dwellMin:760, flight:'WB9316', cutoff:'11:00', handler:'AL RAIS CARGO', temp:null, shc:'GEN' },
  { awb:'459-64788636', origin:'JNB', destination:'LHR', commodity:'Auto Parts', weight:890, pieces:12, location:'JNB-Gen-D7', status:'In Transit', dwellMin:1840, flight:'WB312', cutoff:'21:00', handler:'Bidair JNB', temp:null, shc:'GEN' },
  { awb:'459-66278540', origin:'LOS', destination:'DXB', commodity:'Pharma', weight:150, pieces:3, location:'LOS-CoolRoom-A1', status:'Temp Excursion', dwellMin:420, flight:'WB101', cutoff:'14:00', handler:'Cargo Africa Ltd', temp:'9.4°C', shc:'PIL' },
  { awb:'459-64813401', origin:'EBB', destination:'LHR', commodity:'Coffee (Perishable)', weight:720, pieces:20, location:'KGL-CoolRoom-C2', status:'Connecting', dwellMin:510, flight:'WB710', cutoff:'19:00', handler:'Uganda Air Cargo', temp:'12°C', shc:'COL' },
  { awb:'459-64792880', origin:'KGL', destination:'LHR', commodity:'DG Class 2.2', weight:95, pieces:2, location:'KGL-DG-Bay-1', status:'NOTOC Pending', dwellMin:380, flight:'WB710', cutoff:'18:30', handler:'RwandAir Direct', temp:null, shc:'RCM' },
  { awb:'459-64821455', origin:'DAR', destination:'CDG', commodity:'Tobacco Leaf', weight:2100, pieces:30, location:'NBO-Gen-H3', status:'In Transit', dwellMin:1600, flight:'WB204', cutoff:'18:30', handler:'Dar Freight', temp:null, shc:'GEN' },
  { awb:'459-64805993', origin:'KGL', destination:'CDG', commodity:'Mixed Cargo', weight:3200, pieces:42, location:'KGL-Gen-A1', status:'Departing', dwellMin:280, flight:'WB204', cutoff:'19:00', handler:'RwandAir Direct', temp:null, shc:'GEN' },
  { awb:'459-64833120', origin:'NBO', destination:'DXB', commodity:'Flowers', weight:890, pieces:22, location:'NBO-CoolRoom-B4', status:'In Transit', dwellMin:340, flight:'WB622', cutoff:'22:00', handler:'East Africa Cargo', temp:'5.8°C', shc:'COL' },
];

let _activeTab = 'all';
let _expandedRows = new Set();
let _dwellInterval = null;

export function render() {
  const alerts = TRANSIT_AWBS.filter(a => a.dwellMin > 2880).length;
  const warning = TRANSIT_AWBS.filter(a => a.dwellMin > 2160 && a.dwellMin <= 2880).length;
  const ok = TRANSIT_AWBS.filter(a => a.dwellMin <= 2160).length;

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Warehouse</h1>
      <p class="page-sub">Transit cargo monitoring — dwell times update every 60s</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-sec" onclick="showToast('Warehouse report exported','success','CSV download ready','3000')">Export CSV</button>
      <button class="btn btn-pri" onclick="openBookingModal()">+ Accept Cargo</button>
    </div>
  </div>

  <!-- Summary stats -->
  <div class="kpi-row">
    <div class="kpi-card">
      <div class="kpi-value">${TRANSIT_AWBS.length}</div>
      <div class="kpi-label">In Warehouse</div>
    </div>
    <div class="kpi-card kpi-danger">
      <div class="kpi-value">${alerts}</div>
      <div class="kpi-label">SLA Breached (>48hr)</div>
    </div>
    <div class="kpi-card kpi-warning">
      <div class="kpi-value">${warning}</div>
      <div class="kpi-label">Warning (>36hr)</div>
    </div>
    <div class="kpi-card kpi-ok">
      <div class="kpi-value">${ok}</div>
      <div class="kpi-label">Within SLA</div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs-bar">
    <button class="tab-btn active" data-tab="all" onclick="warehouseTab('all')">All (${TRANSIT_AWBS.length})</button>
    <button class="tab-btn" data-tab="alert" onclick="warehouseTab('alert')">Dwell Alert (${alerts + warning})</button>
    <button class="tab-btn" data-tab="coolchain" onclick="warehouseTab('coolchain')">Cool Chain (${TRANSIT_AWBS.filter(a=>a.temp).length})</button>
    <button class="tab-btn" data-tab="dg" onclick="warehouseTab('dg')">Dangerous Goods (${TRANSIT_AWBS.filter(a=>['RFL','RCM','RBI'].includes(a.shc)).length})</button>
  </div>

  <div class="card" id="warehouse-table-wrap">
    <table class="data-table" id="warehouse-table">
      <thead>
        <tr>
          <th></th>
          <th>AWB</th>
          <th>Route</th>
          <th>Commodity</th>
          <th>Weight</th>
          <th>Location</th>
          <th>Dwell Time</th>
          <th>Next Flight</th>
          <th>Cutoff</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="warehouse-tbody"></tbody>
    </table>
  </div>
  `;
}

export function init() {
  _renderTable();
  // Update dwell times every 60 seconds
  if (_dwellInterval) clearInterval(_dwellInterval);
  _dwellInterval = setInterval(() => {
    TRANSIT_AWBS.forEach(a => a.dwellMin++);
    _updateDwellCells();
  }, 60000);
}

function _getFiltered() {
  if (_activeTab === 'all') return TRANSIT_AWBS;
  if (_activeTab === 'alert') return TRANSIT_AWBS.filter(a => a.dwellMin > 2160);
  if (_activeTab === 'coolchain') return TRANSIT_AWBS.filter(a => a.temp);
  if (_activeTab === 'dg') return TRANSIT_AWBS.filter(a => ['RFL','RCM','RBI','MAG','RMD','RPB','CAO'].includes(a.shc));
  return TRANSIT_AWBS;
}

function _renderTable() {
  const tbody = document.getElementById('warehouse-tbody');
  if (!tbody) return;
  const data = _getFiltered();

  tbody.innerHTML = data.map(a => {
    const statusColors = { 'Dwell Alert':'var(--red)', 'Temp Excursion':'var(--red)', 'NOTOC Pending':'var(--red)',
      'In Transit':'var(--navy)', 'Connecting':'var(--teal)', 'Departing':'var(--green)' };
    const sc = statusColors[a.status] || 'var(--mid)';
    const expanded = _expandedRows.has(a.awb);

    return `
    <tr class="table-row" id="wh-row-${a.awb.replace(/[^a-z0-9]/gi,'')}" onclick="toggleWarehouseRow('${a.awb}')">
      <td><button class="expand-btn">${expanded ? '▼' : '▶'}</button></td>
      <td class="mono text-sm">${esc(a.awb)}</td>
      <td><strong>${esc(a.origin)}→${esc(a.destination)}</strong></td>
      <td class="text-sm">${esc(a.commodity)}</td>
      <td>${a.weight} kg · ${a.pieces}pc</td>
      <td class="text-sm mono">${esc(a.location)}</td>
      <td class="dwell-cell" data-awb="${esc(a.awb)}">${formatDwell(a.dwellMin)}</td>
      <td class="mono text-sm">${esc(a.flight)}</td>
      <td class="mono">${esc(a.cutoff)}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-sec btn-sm" onclick="assignToFlight('${esc(a.awb)}')">Assign</button>
        <button class="btn btn-sec btn-sm" onclick="notifyShipper('${esc(a.awb)}')">Notify</button>
      </td>
    </tr>
    ${expanded ? `
    <tr class="expand-row">
      <td colspan="10">
        <div class="expand-content">
          <div class="expand-grid">
            <div><span class="text-mid">Handler</span><br><strong>${esc(a.handler)}</strong></div>
            <div><span class="text-mid">SHC</span><br><strong class="badge-small">${esc(a.shc)}</strong></div>
            ${a.temp ? `<div><span class="text-mid">Temperature</span><br><strong style="color:${parseFloat(a.temp)>8?'var(--red)':'var(--green)'}">${esc(a.temp)}</strong></div>` : ''}
            <div><span class="text-mid">Status</span><br><strong style="color:${sc}">${esc(a.status)}</strong></div>
          </div>
          <div class="expand-actions">
            <button class="btn btn-pri btn-sm" onclick="showToast('ULD assignment confirmed','success','${esc(a.awb)} loaded to flight ${esc(a.flight)}','4000')">Confirm ULD Build</button>
            <button class="btn btn-sec btn-sm" onclick="showToast('Shipper notified','info','Email sent to ${esc(a.handler)}','3000')">Send Status Update</button>
            ${a.shc === 'PIL' || a.shc === 'COL' ? `<button class="btn btn-warning btn-sm" onclick="showToast('QA alert raised','warning','Temperature QA review triggered for ${esc(a.awb)}','5000')">Raise QA Alert</button>` : ''}
          </div>
        </div>
      </td>
    </tr>` : ''}`;
  }).join('');
}

function _updateDwellCells() {
  document.querySelectorAll('.dwell-cell').forEach(cell => {
    const awb = cell.dataset.awb;
    const item = TRANSIT_AWBS.find(a => a.awb === awb);
    if (item) cell.innerHTML = formatDwell(item.dwellMin);
  });
}

window.warehouseTab = function(tab) {
  _activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  _renderTable();
};

window.toggleWarehouseRow = function(awb) {
  if (_expandedRows.has(awb)) _expandedRows.delete(awb);
  else _expandedRows.add(awb);
  _renderTable();
};

window.assignToFlight = function(awb) {
  const item = TRANSIT_AWBS.find(a => a.awb === awb);
  showToast('Assigned to flight', 'success', `${awb} → ${item?.flight || 'next available'}`, 4000);
};

window.notifyShipper = function(awb) {
  const item = TRANSIT_AWBS.find(a => a.awb === awb);
  showToast('Shipper notified', 'info', `Status update sent for ${awb} via ${item?.handler}`, 3500);
};

export const handler = { render, init };
