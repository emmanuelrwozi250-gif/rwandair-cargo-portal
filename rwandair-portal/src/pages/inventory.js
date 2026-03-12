// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Warehouse Inventory Page
// 22 items, KGL + NBO, zone occupancy chart, live dwell timer
// ═══════════════════════════════════════════════════════════════════

import { INVENTORY_ITEMS, ZONE_CAPACITY, getInventoryByStation, getOccupancyStats } from '../data/inventory.js';
import { formatDate, formatNumber, formatDwell, esc } from '../utils/format.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { doughnutChart, barChart, destroyChart } from '../utils/charts.js';
import { getFlightStaff, getAwbStaff, staffBadgesHtml } from '../data/staff.js';

let _activeTab = 'all';
let _stationFilter = '';
let _statusFilter = '';
let _searchQuery = '';
let _expanded = new Set();
let _dwellInterval = null;
let _sortField = null;
let _sortDir = 'asc';

export function render() {
  const total = INVENTORY_ITEMS.length;
  const exportCount = INVENTORY_ITEMS.filter(i => i.direction === 'Export').length;
  const importCount = INVENTORY_ITEMS.filter(i => i.direction === 'Import').length;

  const kglStats = getOccupancyStats('KGL');
  const nboStats = getOccupancyStats('NBO');
  const combinedTotal = kglStats.totalSqm + nboStats.totalSqm;
  const combinedUsed = kglStats.usedSqm + nboStats.usedSqm;
  const occupancyPct = combinedTotal > 0 ? Math.round((combinedUsed / combinedTotal) * 100) : 0;

  const coolCount = INVENTORY_ITEMS.filter(i => i.zone === 'Cool Room').length;
  const dgCount = INVENTORY_ITEMS.filter(i => i.zone === 'DG Cage').length;
  const valCount = INVENTORY_ITEMS.filter(i => i.zone === 'VAL Vault').length;

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('list', 18)}</span>
        <div>
          <div class="portal-header-title">Warehouse Inventory</div>
          <div class="portal-header-sub">${total} items · KGL + NBO · ${formatDate(new Date(), 'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" onclick="inventoryExport()">
          ${icon('download', 13)} Export CSV
        </button>
        <button class="btn btn-pri btn-sm" onclick="inventoryReceive()">
          ${icon('plus', 13)} Receive Cargo
        </button>
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('package', 11)} Total Items</div>
        <div class="kpi-value kpi-sm">${total}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('archive', 12)} Across all zones</span>
        </div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('activity', 11)} Occupancy</div>
        <div class="kpi-value kpi-sm">${occupancyPct}%</div>
        <div class="kpi-footer" style="margin-top:6px">
          <div style="width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,.2)">
            <div style="width:${occupancyPct}%;height:100%;border-radius:3px;background:rgba(255,255,255,.7)"></div>
          </div>
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('arrow-up-right', 11)} Export Items</div>
        <div class="kpi-value kpi-sm">${exportCount}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check', 12)} Outbound cargo</span>
        </div>
      </div>

      <div class="kpi-card kpi-blue">
        <div class="kpi-label">${icon('arrow-down-left', 11)} Import Items</div>
        <div class="kpi-value kpi-sm">${importCount}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('check', 12)} Inbound cargo</span>
        </div>
      </div>

    </div>

    <!-- ── Tabs bar ────────────────────────────────────────────────── -->
    <div class="tabs-bar">
      <button class="tab-btn active" data-tab="all" onclick="inventoryTab('all')">All (${total})</button>
      <button class="tab-btn" data-tab="export" onclick="inventoryTab('export')">Export (${exportCount})</button>
      <button class="tab-btn" data-tab="import" onclick="inventoryTab('import')">Import (${importCount})</button>
      <button class="tab-btn" data-tab="coolroom" onclick="inventoryTab('coolroom')">Cool Room (${coolCount})</button>
      <button class="tab-btn" data-tab="dgcage" onclick="inventoryTab('dgcage')">DG Cage (${dgCount})</button>
      <button class="tab-btn" data-tab="valvault" onclick="inventoryTab('valvault')">VAL Vault (${valCount})</button>
    </div>

    <!-- ── Filter row ──────────────────────────────────────────────── -->
    <div class="filters-bar" style="display:flex;gap:10px;align-items:center;margin-bottom:12px">
      <select class="search-field" style="max-width:160px" onchange="inventoryStationFilter(this.value)">
        <option value="">All Stations</option>
        <option value="KGL">KGL — Kigali</option>
        <option value="NBO">NBO — Nairobi</option>
      </select>
      <select class="search-field" style="max-width:180px" onchange="inventoryStatusFilter(this.value)">
        <option value="">All Statuses</option>
        <option value="Stored">Stored</option>
        <option value="Staged">Staged</option>
        <option value="Ready for ULD">Ready for ULD</option>
        <option value="Pending Customs">Pending Customs</option>
        <option value="Dwell Alert">Dwell Alert</option>
      </select>
      <input class="search-field" style="flex:1" type="text" placeholder="Search AWB, commodity, route..." oninput="inventorySearch(this.value)">
    </div>

    <!-- ── Data table ──────────────────────────────────────────────── -->
    <div class="card" id="inventory-table-wrap">
      <table class="data-table" id="inventory-table">
        <thead id="inventory-thead">
          <tr>
            <th></th>
            <th class="sortable" onclick="inventorySort('awb')">AWB</th>
            <th class="sortable" onclick="inventorySort('route')">Route</th>
            <th class="sortable" onclick="inventorySort('weight')">Weight / Pcs</th>
            <th class="sortable" onclick="inventorySort('zone')">Zone</th>
            <th class="sortable" onclick="inventorySort('status')">Status</th>
            <th class="sortable" onclick="inventorySort('dwell')">Dwell Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="inventory-tbody"></tbody>
      </table>
    </div>

    <!-- ── Zone occupancy chart ────────────────────────────────────── -->
    <div class="card" style="margin-top:16px">
      <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:600">Zone Occupancy</h3>
      <div style="display:flex;gap:24px;align-items:center">
        <div style="width:280px;height:280px">
          <canvas id="inventory-zone-chart"></canvas>
        </div>
        <div id="inventory-zone-legend" style="flex:1"></div>
      </div>
    </div>

  </div>`;
}

export function init(container) {
  _renderTable();
  _renderZoneChart();
  // Update dwell times every 60 seconds
  if (_dwellInterval) clearInterval(_dwellInterval);
  _dwellInterval = setInterval(() => {
    INVENTORY_ITEMS.forEach(i => i.dwellMin++);
    _updateDwellCells();
  }, 60000);
}

// ── Filtering ───────────────────────────────────────────────────────

function _getFiltered() {
  let items = INVENTORY_ITEMS;

  // Tab filter
  if (_activeTab === 'export') items = items.filter(i => i.direction === 'Export');
  else if (_activeTab === 'import') items = items.filter(i => i.direction === 'Import');
  else if (_activeTab === 'coolroom') items = items.filter(i => i.zone === 'Cool Room');
  else if (_activeTab === 'dgcage') items = items.filter(i => i.zone === 'DG Cage');
  else if (_activeTab === 'valvault') items = items.filter(i => i.zone === 'VAL Vault');

  // Station filter
  if (_stationFilter) items = items.filter(i => i.station === _stationFilter);

  // Status filter
  if (_statusFilter) items = items.filter(i => i.status === _statusFilter);

  // Search
  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    items = items.filter(i =>
      i.awb.toLowerCase().includes(q) ||
      i.commodity.toLowerCase().includes(q) ||
      i.route.toLowerCase().includes(q) ||
      i.bin.toLowerCase().includes(q) ||
      i.handler.toLowerCase().includes(q)
    );
  }

  // Sort
  if (_sortField) {
    items = [...items].sort((a, b) => {
      let va, vb;
      switch (_sortField) {
        case 'awb':    va = a.awb;      vb = b.awb;      break;
        case 'route':  va = a.route;    vb = b.route;    break;
        case 'weight': va = a.weight;   vb = b.weight;   break;
        case 'zone':   va = a.zone;     vb = b.zone;     break;
        case 'status': va = a.status;   vb = b.status;   break;
        case 'dwell':  va = a.dwellMin; vb = b.dwellMin; break;
        default: return 0;
      }
      if (typeof va === 'number') {
        return _sortDir === 'asc' ? va - vb : vb - va;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      if (va < vb) return _sortDir === 'asc' ? -1 : 1;
      if (va > vb) return _sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return items;
}

// ── Table Rendering ─────────────────────────────────────────────────

function _statusBadge(status) {
  const colors = {
    'Stored': 'badge-navy',
    'Staged': 'badge-teal',
    'Ready for ULD': 'badge-green',
    'Pending Customs': 'badge-amber',
    'Dwell Alert': 'badge-red'
  };
  return `<span class="badge ${colors[status] || 'badge-navy'}">${esc(status)}</span>`;
}

function _directionBadge(dir) {
  return dir === 'Export'
    ? `<span class="badge badge-green">Export</span>`
    : `<span class="badge badge-blue">Import</span>`;
}

function _updateSortHeaders() {
  const thead = document.getElementById('inventory-thead');
  if (!thead) return;
  thead.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    const field = th.getAttribute('onclick');
    if (_sortField && field && field.includes(`'${_sortField}'`)) {
      th.classList.add(_sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
    }
  });
}

function _renderTable() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;
  _updateSortHeaders();
  const data = _getFiltered();

  tbody.innerHTML = data.map(item => {
    const expanded = _expanded.has(item.awb);
    const staff = getAwbStaff(item.awb);
    const inboundStaff = item.inboundFlight ? getFlightStaff(item.inboundFlight) : null;
    const outboundStaff = item.outboundFlight ? getFlightStaff(item.outboundFlight) : null;

    return `
    <tr class="table-row" id="inv-row-${item.awb.replace(/[^a-z0-9]/gi, '')}" onclick="toggleInventoryRow('${esc(item.awb)}')">
      <td><button class="expand-btn">${expanded ? '▼' : '▶'}</button></td>
      <td class="mono text-sm">${esc(item.awb)}</td>
      <td><strong>${esc(item.route)}</strong></td>
      <td>${formatNumber(item.weight, 'weight')} · ${item.pieces}pc</td>
      <td class="text-sm">${esc(item.zone)}</td>
      <td>${_statusBadge(item.status)}</td>
      <td class="dwell-cell" data-awb="${esc(item.awb)}">${formatDwell(item.dwellMin)}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-sec btn-sm" onclick="inventoryView('${esc(item.awb)}')" title="View details">${icon('eye', 13)}</button>
        <button class="btn btn-sec btn-sm" onclick="inventoryMove('${esc(item.awb)}')" title="Move item">${icon('arrow-right', 13)}</button>
      </td>
    </tr>
    ${expanded ? `
    <tr class="expand-row">
      <td colspan="8">
        <div class="expand-content">
          <div class="expand-grid">
            <div><span class="text-mid">Direction</span><br>${_directionBadge(item.direction)}</div>
            <div><span class="text-mid">Commodity</span><br><strong>${esc(item.commodity)}</strong></div>
            <div><span class="text-mid">Bin Location</span><br><strong class="mono">${esc(item.bin)}</strong></div>
            <div><span class="text-mid">Handler</span><br><strong>${esc(item.handler)}</strong></div>
            <div><span class="text-mid">SHC</span><br><strong class="badge-small">${esc(item.shc)}</strong></div>
            ${item.temp ? `<div><span class="text-mid">Temperature</span><br><strong style="color:${parseFloat(item.temp) > 8 ? 'var(--red)' : 'var(--green)'}">${esc(item.temp)}</strong></div>` : ''}
            ${item.inboundFlight ? `<div><span class="text-mid">Inbound Flight</span><br><strong class="mono">${esc(item.inboundFlight)}</strong></div>` : ''}
            ${item.outboundFlight ? `<div><span class="text-mid">Outbound Flight</span><br><strong class="mono">${esc(item.outboundFlight)}</strong></div>` : ''}
            <div><span class="text-mid">Station</span><br><strong>${esc(item.station)}</strong></div>
          </div>
          <div style="margin-top:10px">
            <span class="text-mid" style="display:block;margin-bottom:4px">Staff Assignment</span>
            ${staffBadgesHtml(staff)}
          </div>
          <div class="expand-actions" style="margin-top:10px">
            <button class="btn btn-pri btn-sm" onclick="showToast('Item moved','success','${esc(item.awb)} relocated successfully','4000')">Move to Zone</button>
            <button class="btn btn-sec btn-sm" onclick="showToast('Status updated','info','${esc(item.awb)} status refreshed','3000')">Update Status</button>
            ${item.status === 'Dwell Alert' ? `<button class="btn btn-warning btn-sm" onclick="showToast('Escalation raised','warning','Dwell alert escalated for ${esc(item.awb)}','5000')">Escalate</button>` : ''}
          </div>
        </div>
      </td>
    </tr>` : ''}`;
  }).join('');
}

function _updateDwellCells() {
  document.querySelectorAll('.dwell-cell').forEach(cell => {
    const awb = cell.dataset.awb;
    const item = INVENTORY_ITEMS.find(i => i.awb === awb);
    if (item) cell.innerHTML = formatDwell(item.dwellMin);
  });
}

// ── Zone Occupancy Chart ────────────────────────────────────────────

function _renderZoneChart() {
  const station = _stationFilter || null;
  let labels = [];
  let data = [];
  let colors = ['#00529B', '#00897B', '#E65100', '#6A1B9A', '#37474F'];

  if (station) {
    const stats = getOccupancyStats(station);
    for (const [zone, info] of Object.entries(stats.zones)) {
      labels.push(zone + ' (' + info.pct + '%)');
      data.push(info.usedSqm);
    }
  } else {
    // Combined view
    const zones = ['General', 'Cool Room', 'DG Cage', 'VAL Vault', 'Bulk'];
    zones.forEach(zone => {
      const kgl = ZONE_CAPACITY.KGL[zone] || { usedSqm: 0, totalSqm: 0 };
      const nbo = ZONE_CAPACITY.NBO[zone] || { usedSqm: 0, totalSqm: 0 };
      const used = kgl.usedSqm + nbo.usedSqm;
      const total = kgl.totalSqm + nbo.totalSqm;
      const pct = total > 0 ? Math.round((used / total) * 100) : 0;
      labels.push(zone + ' (' + pct + '%)');
      data.push(used);
    });
  }

  doughnutChart('inventory-zone-chart', labels, data, colors);

  // Render legend detail
  const legendEl = document.getElementById('inventory-zone-legend');
  if (legendEl) {
    const zones = ['General', 'Cool Room', 'DG Cage', 'VAL Vault', 'Bulk'];
    legendEl.innerHTML = `
      <table class="data-table" style="font-size:12px">
        <thead>
          <tr><th>Zone</th><th>KGL (sqm)</th><th>NBO (sqm)</th><th>Combined</th></tr>
        </thead>
        <tbody>
          ${zones.map(zone => {
            const kgl = ZONE_CAPACITY.KGL[zone] || { usedSqm: 0, totalSqm: 0 };
            const nbo = ZONE_CAPACITY.NBO[zone] || { usedSqm: 0, totalSqm: 0 };
            const combinedUsed = kgl.usedSqm + nbo.usedSqm;
            const combinedTotal = kgl.totalSqm + nbo.totalSqm;
            const pct = combinedTotal > 0 ? Math.round((combinedUsed / combinedTotal) * 100) : 0;
            return `<tr>
              <td><strong>${esc(zone)}</strong></td>
              <td>${formatNumber(kgl.usedSqm)} / ${formatNumber(kgl.totalSqm)}</td>
              <td>${formatNumber(nbo.usedSqm)} / ${formatNumber(nbo.totalSqm)}</td>
              <td><strong>${pct}%</strong> (${formatNumber(combinedUsed)} / ${formatNumber(combinedTotal)} sqm)</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }
}

// ── Window Global Handlers ──────────────────────────────────────────

window.inventoryTab = function(tab) {
  _activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  _renderTable();
};

window.inventoryStationFilter = function(station) {
  _stationFilter = station;
  _renderTable();
  _renderZoneChart();
};

window.inventoryStatusFilter = function(status) {
  _statusFilter = status;
  _renderTable();
};

window.inventorySearch = function(q) {
  _searchQuery = q.trim();
  _renderTable();
};

window.inventorySort = function(field) {
  if (_sortField === field) {
    _sortDir = _sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _sortField = field;
    _sortDir = 'asc';
  }
  _renderTable();
};

window.toggleInventoryRow = function(awb) {
  if (_expanded.has(awb)) _expanded.delete(awb);
  else _expanded.add(awb);
  _renderTable();
};

window.inventoryView = function(awb) {
  const item = INVENTORY_ITEMS.find(i => i.awb === awb);
  if (!item) return;
  showToast('Item Details', 'info', `${awb} — ${item.commodity} · ${item.weight} kg · ${item.zone} · ${item.bin}`, 5000);
};

window.inventoryMove = function(awb) {
  const item = INVENTORY_ITEMS.find(i => i.awb === awb);
  if (!item) return;
  showToast('Move Initiated', 'success', `${awb} — select destination zone for ${item.commodity}`, 4000);
};

window.inventoryExport = function() {
  const data = _getFiltered();
  const header = 'AWB,Direction,Route,Commodity,Weight,Pieces,Zone,Bin,Status,Dwell (min),Station,SHC';
  const rows = data.map(i =>
    `${i.awb},${i.direction},${i.route},${i.commodity},${i.weight},${i.pieces},${i.zone},${i.bin},${i.status},${i.dwellMin},${i.station},${i.shc}`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Inventory exported', 'success', `${data.length} items exported to CSV`, 3000);
};

window.inventoryReceive = function() {
  showToast('Receive Cargo', 'info', 'Cargo receiving workflow initiated — scan AWB or enter manually', 4000);
};

export const handler = { render, init };
