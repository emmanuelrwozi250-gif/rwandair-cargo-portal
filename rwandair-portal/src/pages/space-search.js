// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Space Search (Home / Default)
// ═══════════════════════════════════════════════════════════════════

import { FLIGHTS } from '../data/flights.js';
import { RATE_CARDS, CARGO_TYPES } from '../data/rates.js';
import { STATIONS } from '../data/stations.js';
import { BOOKINGS_DATA } from '../data/bookings.js';
import { formatNumber, formatDate, esc, debounce } from '../utils/format.js';
import { saveQuote, getQuotes } from '../utils/storage.js';
import { buildBarChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { openBookingModal } from '../components/modals.js';

// Today's representative flights with capacity data
const TODAY_FLIGHTS = [
  { flight: 'WB710',  origin: 'KGL', dest: 'LHR', std: '22:40', etd: '22:40', aircraft: 'A330-200', cap: 14000, booked: 10290, status: 'On Time' },
  { flight: 'WB711',  origin: 'LHR', dest: 'KGL', std: '20:30', etd: '20:30', aircraft: 'A330-200', cap: 14000, booked: 11480, status: 'On Time' },
  { flight: 'WB700',  origin: 'KGL', dest: 'CDG', std: '00:05', etd: '00:05', aircraft: 'A330-200', cap: 14000, booked: 9940,  status: 'On Time' },
  { flight: 'WB701',  origin: 'CDG', dest: 'KGL', std: '10:15', etd: '10:50', aircraft: 'A330-200', cap: 14000, booked: 13440, status: 'Delayed' },
  { flight: 'WB9316', origin: 'DWC', dest: 'KGL', std: '01:30', etd: '01:30', aircraft: 'B737-800',  cap: 4500,  booked: 3555,  status: 'On Time' },
  { flight: 'WB9317', origin: 'KGL', dest: 'DWC', std: '08:45', etd: '08:45', aircraft: 'B737-800',  cap: 4500,  booked: 2925,  status: 'On Time' },
  { flight: 'WB204',  origin: 'NBO', dest: 'LHR', std: '22:15', etd: '22:15', aircraft: 'A330-200', cap: 14000, booked: 13720, status: 'On Time' },
  { flight: 'WB205',  origin: 'LHR', dest: 'NBO', std: '09:00', etd: '09:00', aircraft: 'A330-200', cap: 14000, booked: 8960,  status: 'On Time' },
  { flight: 'WB444',  origin: 'KGL', dest: 'ZNZ', std: '14:00', etd: '14:00', aircraft: 'B737-800',  cap: 4500,  booked: 1350,  status: 'On Time' },
  { flight: 'WB313',  origin: 'JNB', dest: 'KGL', std: '11:30', etd: '11:30', aircraft: 'B737-800',  cap: 4500,  booked: 3285,  status: 'On Time' },
];

const STATION_OPTS = STATIONS.map(s => `<option value="${s.code}">${s.code} — ${s.city}</option>`).join('');

function render() {
  const totalCap    = TODAY_FLIGHTS.reduce((s, f) => s + f.cap, 0);
  const totalBooked = TODAY_FLIGHTS.reduce((s, f) => s + f.booked, 0);
  const avail       = totalCap - totalBooked;
  const avgLF       = (totalBooked / totalCap * 100).toFixed(1);
  const todayBkgs   = BOOKINGS_DATA.filter(b => b.bookDate === '2026-03-11').length;
  const todayRev    = BOOKINGS_DATA.filter(b => b.bookDate === '2026-03-11').reduce((s, b) => s + (b.charge || 0), 0);

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Space Search</h1>
        <p class="page-sub">Live belly capacity — ${formatDate(new Date(), 'short')}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-sec" onclick="spaceSearchRefresh()">&#8635; Refresh</button>
        <button class="btn btn-pri" onclick="openBookingModal()">+ New Booking</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Available Capacity Today</div>
        <div class="kpi-value">${formatNumber(avail)}<span class="kpi-unit"> kg</span></div>
        <div class="kpi-delta delta-up">Across ${TODAY_FLIGHTS.length} flights</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Bookings Today</div>
        <div class="kpi-value">${todayBkgs + 9}</div>
        <div class="kpi-delta delta-up">+3 vs yesterday</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg. Load Factor</div>
        <div class="kpi-value">${avgLF}<span class="kpi-unit">%</span></div>
        <div class="kpi-delta ${parseFloat(avgLF) > 75 ? 'delta-up' : 'delta-down'}">${parseFloat(avgLF) > 75 ? 'Above target' : 'Below target'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Revenue Today</div>
        <div class="kpi-value">${formatNumber(todayRev + 26840, 'currency')}</div>
        <div class="kpi-delta delta-up">+8.4% vs LY</div>
      </div>
    </div>

    <!-- Quick Search Form -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><h3 class="card-title">Quick Space Search</h3></div>
      <div class="card-body">
        <form id="ss-form" onsubmit="runSpaceSearch(event)" style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end">
          <div class="form-group" style="flex:1;min-width:140px">
            <label class="form-label">Origin</label>
            <select class="form-select" id="ss-origin"><option value="">Any Origin</option>${STATION_OPTS}</select>
          </div>
          <div class="form-group" style="flex:1;min-width:140px">
            <label class="form-label">Destination</label>
            <select class="form-select" id="ss-dest"><option value="">Any Destination</option>${STATION_OPTS}</select>
          </div>
          <div class="form-group" style="flex:0 0 160px">
            <label class="form-label">Aircraft Type</label>
            <select class="form-select" id="ss-ac">
              <option value="">All Aircraft</option>
              <option value="A330-200">A330-200</option>
              <option value="B737-800">B737-800</option>
            </select>
          </div>
          <div class="form-group" style="flex:0 0 120px">
            <label class="form-label">Min Avail (kg)</label>
            <input type="number" class="form-input" id="ss-minkg" min="0" placeholder="e.g. 500">
          </div>
          <button type="submit" class="btn btn-pri">Search</button>
          <button type="button" class="btn btn-sec" onclick="document.getElementById('ss-form').reset();renderFlightTable(null)">Clear</button>
        </form>
      </div>
    </div>

    <!-- Flights Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Today's WB Flight Programme</h3>
        <span class="badge badge-blue" id="flight-count">${TODAY_FLIGHTS.length} flights</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Flight</th><th>Route</th><th>STD</th><th>ETD</th>
              <th>Aircraft</th><th>Booked (kg)</th><th>Available (kg)</th>
              <th>Load %</th><th>Status</th><th class="table-actions">Actions</th>
            </tr>
          </thead>
          <tbody id="flights-tbody">
            ${TODAY_FLIGHTS.map(f => _flightRow(f)).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Chart -->
    <div class="card" style="margin-top:16px">
      <div class="card-header"><h3 class="card-title">Load Factor by Flight</h3></div>
      <div class="card-body">
        <div class="chart-wrap" style="height:200px"><canvas id="ss-lf-chart"></canvas></div>
      </div>
    </div>
  </div>`;
}

function _flightRow(f) {
  const avail = f.cap - f.booked;
  const lf = Math.round(f.booked / f.cap * 100);
  const lfCls = lf >= 90 ? 'badge-red' : lf >= 75 ? 'badge-amber' : 'badge-green';
  const stCls = f.status === 'On Time' ? 'badge-green' : f.status === 'Delayed' ? 'badge-amber' : 'badge-red';
  return `<tr>
    <td><strong class="mono">${esc(f.flight)}</strong></td>
    <td>${esc(f.origin)} → ${esc(f.dest)}</td>
    <td>${esc(f.std)}</td>
    <td>${f.etd !== f.std ? `<span style="color:var(--amber);font-weight:600">${esc(f.etd)}</span>` : esc(f.etd)}</td>
    <td class="text-sm text-mid">${esc(f.aircraft)}</td>
    <td>${formatNumber(f.booked)}</td>
    <td><strong>${formatNumber(avail)}</strong></td>
    <td><span class="badge ${lfCls}">${lf}%</span></td>
    <td><span class="badge ${stCls}">${esc(f.status)}</span></td>
    <td class="row-actions">
      <button class="btn btn-ghost btn-sm" onclick="openBookingModal()">Book</button>
      <button class="btn btn-ghost btn-sm" onclick="showToast('${esc(f.flight)} — ${esc(f.origin)}→${esc(f.dest)}','info','Capacity: ${formatNumber(avail)} kg available',3000)">Details</button>
    </td>
  </tr>`;
}

function init(container) {
  // Load factor bar chart
  buildBarChart(
    'ss-lf-chart',
    TODAY_FLIGHTS.map(f => f.flight),
    [{
      label: 'Load Factor %',
      data: TODAY_FLIGHTS.map(f => Math.round(f.booked / f.cap * 100)),
      backgroundColor: TODAY_FLIGHTS.map(f => {
        const lf = f.booked / f.cap * 100;
        return lf >= 90 ? '#C0392B' : lf >= 75 ? '#D97706' : '#1A8A4A';
      }),
      borderRadius: 4,
    }],
    { plugins: { legend: { display: false } }, scales: { y: { max: 100, ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,.04)' } }, x: { grid: { display: false } } } }
  );

  window.spaceSearchRefresh = () => showToast('Data refreshed', 'success', 'Live capacity data updated', 2000);

  window.renderFlightTable = (filtered) => {
    const data = filtered || TODAY_FLIGHTS;
    const tbody = document.getElementById('flights-tbody');
    if (tbody) tbody.innerHTML = data.map(f => _flightRow(f)).join('');
    const cnt = document.getElementById('flight-count');
    if (cnt) cnt.textContent = `${data.length} flights`;
  };

  window.runSpaceSearch = (e) => {
    e.preventDefault();
    const origin = document.getElementById('ss-origin')?.value;
    const dest   = document.getElementById('ss-dest')?.value;
    const ac     = document.getElementById('ss-ac')?.value;
    const minKg  = parseFloat(document.getElementById('ss-minkg')?.value) || 0;
    let results = [...TODAY_FLIGHTS];
    if (origin) results = results.filter(f => f.origin === origin);
    if (dest)   results = results.filter(f => f.dest === dest);
    if (ac)     results = results.filter(f => f.aircraft === ac);
    if (minKg)  results = results.filter(f => (f.cap - f.booked) >= minKg);
    window.renderFlightTable(results);
    showToast(`${results.length} flight${results.length !== 1 ? 's' : ''} found`, 'info', '', 1500);
  };
}

export const handler = { render, init };
