// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — My Bookings Page
// 15 rows, filters, search, side panel detail, bulk actions, pagination
// ═══════════════════════════════════════════════════════════════════

import { BOOKINGS_DATA } from '../data/bookings.js';
import { formatNumber, formatDate, esc, debounce } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { getAwbStaff, staffBadgesHtml } from '../data/staff.js';

const PAGE_SIZE = 8;
let _filtered = [...BOOKINGS_DATA];
let _selected = new Set();
let _page = 1;
let _sort = { col: 'bookDate', dir: 'desc' };
let _panelBooking = null;

const STATUS_COLORS = {
  'Confirmed':   { bg: 'var(--teal)20',  text: 'var(--teal)' },
  'In Transit':  { bg: 'var(--navy)15',  text: 'var(--navy)' },
  'Delivered':   { bg: 'var(--green)20', text: 'var(--green)' },
  'On Hold':     { bg: 'var(--amber)20', text: 'var(--amber)' },
  'Cancelled':   { bg: 'var(--red)20',   text: 'var(--red)' },
};

export function render() {
  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">My Bookings</h1>
      <p class="page-sub">${BOOKINGS_DATA.length} bookings in this period</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-sec" id="bulk-cancel-btn" style="display:none" onclick="bulkCancel()">Cancel Selected</button>
      <button class="btn btn-pri" onclick="openBookingModal()">+ New Booking</button>
    </div>
  </div>

  <!-- Filters -->
  <div class="card filters-bar">
    <input type="search" class="form-control filter-search" id="bk-search"
           placeholder="Search AWB, shipper, route…" oninput="debouncedBookingSearch(this.value)">
    <select class="form-control filter-select" id="bk-status-filter" onchange="filterBookings()">
      <option value="">All Status</option>
      <option>Confirmed</option>
      <option>In Transit</option>
      <option>Delivered</option>
      <option>On Hold</option>
      <option>Cancelled</option>
    </select>
    <select class="form-control filter-select" id="bk-commodity-filter" onchange="filterBookings()">
      <option value="">All Commodities</option>
      <option>General Cargo</option>
      <option>Perishables</option>
      <option>Electronics</option>
      <option>Pharma</option>
      <option>Valuables</option>
      <option>Automotive Parts</option>
      <option>Garments</option>
    </select>
    <button class="btn btn-sec" onclick="clearBookingFilters()">Clear</button>
  </div>

  <!-- Table + side panel wrapper -->
  <div class="bookings-layout" id="bookings-layout">
    <div class="card table-card" id="bookings-table-wrap">
      <table class="data-table" id="bookings-table">
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all" onclick="toggleSelectAll(this)"></th>
            <th class="sortable" data-col="awb" onclick="sortBookings('awb')">AWB</th>
            <th class="sortable" data-col="route" onclick="sortBookings('route')">Route</th>
            <th class="sortable" data-col="shipper" onclick="sortBookings('shipper')">Shipper</th>
            <th class="sortable" data-col="commodity" onclick="sortBookings('commodity')">Commodity</th>
            <th class="sortable" data-col="weightKg" onclick="sortBookings('weightKg')">Weight</th>
            <th class="sortable" data-col="departure" onclick="sortBookings('departure')">Departure</th>
            <th class="sortable" data-col="status" onclick="sortBookings('status')">Status</th>
            <th class="sortable" data-col="charge" onclick="sortBookings('charge')">Charge</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="bookings-tbody"></tbody>
      </table>
      <div class="table-footer" id="bk-pagination"></div>
    </div>
    <div id="booking-detail-panel" style="display:none"></div>
  </div>
  `;
}

export function init() {
  window.debouncedBookingSearch = debounce(val => {
    const statusFilter = document.getElementById('bk-status-filter')?.value || '';
    const commodityFilter = document.getElementById('bk-commodity-filter')?.value || '';
    _applyFilters(val, statusFilter, commodityFilter);
  }, 300);

  _renderTable();
}

// ── Table rendering ───────────────────────────────────────────────

function _renderTable() {
  const sorted = _sortData([..._filtered]);
  const total = sorted.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  _page = Math.min(_page, pages || 1);
  const start = (_page - 1) * PAGE_SIZE;
  const slice = sorted.slice(start, start + PAGE_SIZE);

  const tbody = document.getElementById('bookings-tbody');
  if (!tbody) return;

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-cell">No bookings match your filters</td></tr>`;
  } else {
    tbody.innerHTML = slice.map(b => {
      const sc = STATUS_COLORS[b.status] || { bg: 'var(--smoke)', text: 'var(--mid)' };
      return `
      <tr class="table-row ${_selected.has(b.id) ? 'selected' : ''}" onclick="openBookingPanel('${b.id}')">
        <td onclick="event.stopPropagation()">
          <input type="checkbox" ${_selected.has(b.id) ? 'checked' : ''}
                 onchange="toggleSelect('${b.id}',this.checked)">
        </td>
        <td class="mono text-sm">${esc(b.awb)}</td>
        <td><strong>${esc(b.route)}</strong></td>
        <td class="text-sm">${esc(b.shipper)}</td>
        <td class="text-sm">${esc(b.commodity)}</td>
        <td>${formatNumber(b.weightKg)} kg</td>
        <td class="text-sm">${formatDate(b.departure, 'short')}</td>
        <td>
          <span class="badge" style="background:${sc.bg};color:${sc.text}">${esc(b.status)}</span>
        </td>
        <td><strong>${formatNumber(b.charge, 'currency')}</strong></td>
        <td>
          <button class="btn-icon" title="View" onclick="event.stopPropagation();openBookingPanel('${b.id}')">👁</button>
        </td>
      </tr>`;
    }).join('');
  }

  // Pagination
  const pag = document.getElementById('bk-pagination');
  if (pag) {
    pag.innerHTML = `
    <span class="text-mid text-sm">Showing ${start+1}–${Math.min(start+PAGE_SIZE, total)} of ${total}</span>
    <div class="pagination-btns">
      <button class="btn btn-sec btn-sm" ${_page <= 1 ? 'disabled' : ''} onclick="bkPage(${_page-1})">‹ Prev</button>
      ${Array.from({length: pages}, (_,i) => `
        <button class="btn btn-sm ${i+1===_page?'btn-pri':'btn-sec'}" onclick="bkPage(${i+1})">${i+1}</button>
      `).join('')}
      <button class="btn btn-sec btn-sm" ${_page >= pages ? 'disabled' : ''} onclick="bkPage(${_page+1})">Next ›</button>
    </div>`;
  }

  // Update sort indicators
  document.querySelectorAll('.sortable').forEach(th => {
    const col = th.dataset.col;
    th.innerHTML = th.innerHTML.replace(/ [▲▼]$/, '');
    if (col === _sort.col) th.innerHTML += _sort.dir === 'asc' ? ' ▲' : ' ▼';
  });

  // Bulk action visibility
  const bulkBtn = document.getElementById('bulk-cancel-btn');
  if (bulkBtn) bulkBtn.style.display = _selected.size > 0 ? 'inline-flex' : 'none';
}

function _sortData(data) {
  return data.sort((a, b) => {
    const va = a[_sort.col], vb = b[_sort.col];
    const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return _sort.dir === 'asc' ? cmp : -cmp;
  });
}

function _applyFilters(search, status, commodity) {
  const ql = (search || '').toLowerCase();
  _filtered = BOOKINGS_DATA.filter(b => {
    const matchSearch = !ql || b.awb.toLowerCase().includes(ql) ||
      b.shipper.toLowerCase().includes(ql) || b.route.toLowerCase().includes(ql) ||
      b.commodity.toLowerCase().includes(ql);
    const matchStatus = !status || b.status === status;
    const matchCom = !commodity || b.commodity === commodity;
    return matchSearch && matchStatus && matchCom;
  });
  _page = 1;
  _renderTable();
}

// ── Global handlers ───────────────────────────────────────────────

window.filterBookings = function() {
  const search = document.getElementById('bk-search')?.value || '';
  const status = document.getElementById('bk-status-filter')?.value || '';
  const commodity = document.getElementById('bk-commodity-filter')?.value || '';
  _applyFilters(search, status, commodity);
};

window.clearBookingFilters = function() {
  ['bk-search','bk-status-filter','bk-commodity-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  _filtered = [...BOOKINGS_DATA];
  _page = 1;
  _renderTable();
};

window.sortBookings = function(col) {
  if (_sort.col === col) _sort.dir = _sort.dir === 'asc' ? 'desc' : 'asc';
  else { _sort.col = col; _sort.dir = 'asc'; }
  _renderTable();
};

window.bkPage = function(p) { _page = p; _renderTable(); };

window.toggleSelect = function(id, checked) {
  if (checked) _selected.add(id);
  else _selected.delete(id);
  _renderTable();
};

window.toggleSelectAll = function(cb) {
  const sorted = _sortData([..._filtered]);
  const slice = sorted.slice((_page-1)*PAGE_SIZE, _page*PAGE_SIZE);
  if (cb.checked) slice.forEach(b => _selected.add(b.id));
  else _selected.clear();
  _renderTable();
};

window.bulkCancel = function() {
  const count = _selected.size;
  showToast(`${count} booking${count>1?'s':''} marked for cancellation`, 'warning', 'Pending supervisor approval', 4000);
  _selected.clear();
  _renderTable();
};

window.openBookingPanel = function(id) {
  const b = BOOKINGS_DATA.find(x => x.id === id);
  if (!b) return;
  _panelBooking = b;

  const sc = STATUS_COLORS[b.status] || { bg: 'var(--smoke)', text: 'var(--mid)' };
  const layout = document.getElementById('bookings-layout');
  const tableWrap = document.getElementById('bookings-table-wrap');
  const panel = document.getElementById('booking-detail-panel');

  if (!layout || !panel) return;

  tableWrap.style.flex = '1 1 60%';
  panel.style.display = 'block';
  layout.style.display = 'flex';
  layout.style.gap = '16px';

  panel.innerHTML = `
  <div class="card detail-panel">
    <div class="detail-panel-header">
      <h3>Booking Detail</h3>
      <button class="btn-icon" onclick="closeBookingPanel()">✕</button>
    </div>
    <div class="detail-section">
      <div class="detail-awb mono">${esc(b.awb)}</div>
      <span class="badge" style="background:${sc.bg};color:${sc.text}">${esc(b.status)}</span>
    </div>
    <div class="detail-grid">
      <div class="detail-row"><span>Route</span><strong>${esc(b.route)}</strong></div>
      <div class="detail-row"><span>Flight</span><strong class="mono">${esc(b.flight)}</strong></div>
      <div class="detail-row"><span>Departure</span><strong>${formatDate(b.departure,'short')}</strong></div>
      <div class="detail-row"><span>Booked</span><strong>${formatDate(b.bookDate,'short')}</strong></div>
      <div class="detail-row"><span>Shipper</span><strong>${esc(b.shipper)}</strong></div>
      <div class="detail-row"><span>GSA</span><strong>${esc(b.gsa)}</strong></div>
      <div class="detail-row"><span>Commodity</span><strong>${esc(b.commodity)}</strong></div>
      <div class="detail-row"><span>Weight</span><strong>${formatNumber(b.weightKg)} kg</strong></div>
      <div class="detail-row"><span>Volume</span><strong>${b.volume} CBM</strong></div>
      <div class="detail-row"><span>Rate</span><strong>$${b.rate}/kg</strong></div>
      <div class="detail-row"><span>Total Charge</span><strong>${formatNumber(b.charge, 'currency')}</strong></div>
      <div class="detail-row"><span>Staff Assignment</span><span style="display:flex;gap:6px">${staffBadgesHtml(getAwbStaff(b.awb))}</span></div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-sec btn-sm" onclick="showToast('AWB document generated','success','PDF download would open','3000')">Print AWB</button>
      <button class="btn btn-sec btn-sm" onclick="showToast('Tracking details opened','info')">Track</button>
      <button class="btn btn-danger btn-sm" onclick="showToast('Cancel request submitted','warning','Pending supervisor approval','4000');closeBookingPanel()">Cancel</button>
    </div>
  </div>`;
};

window.closeBookingPanel = function() {
  const panel = document.getElementById('booking-detail-panel');
  const tableWrap = document.getElementById('bookings-table-wrap');
  if (panel) panel.style.display = 'none';
  if (tableWrap) tableWrap.style.flex = '';
};

export const handler = { render, init };
