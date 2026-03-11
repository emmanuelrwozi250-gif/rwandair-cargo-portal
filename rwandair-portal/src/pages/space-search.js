// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Space Search (GSA Portal Home)
// Live belly capacity · Flight availability · Booking launcher
// ═══════════════════════════════════════════════════════════════════

import { FLIGHTS }          from '../data/flights.js';
import { STATIONS }         from '../data/stations.js';
import { BOOKINGS_DATA }    from '../data/bookings.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart }    from '../utils/charts.js';
import { showToast }        from '../components/toast.js';
import { openBookingModal } from '../components/modals.js';
import { icon }             from '../utils/icons.js';

// ── Today's flight data ───────────────────────────────────────────
const TODAY_FLIGHTS = [
  { flight:'WB710',  origin:'KGL', dest:'LHR', std:'22:40', etd:'22:40', aircraft:'A330-200', cap:14000, booked:10290, status:'On Time',   region:'Europe' },
  { flight:'WB711',  origin:'LHR', dest:'KGL', std:'20:30', etd:'20:30', aircraft:'A330-200', cap:14000, booked:11480, status:'On Time',   region:'Europe' },
  { flight:'WB700',  origin:'KGL', dest:'CDG', std:'00:05', etd:'00:05', aircraft:'A330-200', cap:14000, booked:9940,  status:'On Time',   region:'Europe' },
  { flight:'WB701',  origin:'CDG', dest:'KGL', std:'10:15', etd:'10:50', aircraft:'A330-200', cap:14000, booked:13440, status:'Delayed',   region:'Europe' },
  { flight:'WB9316', origin:'DWC', dest:'KGL', std:'01:30', etd:'01:30', aircraft:'B737-800', cap:4500,  booked:3555,  status:'On Time',   region:'Gulf' },
  { flight:'WB9317', origin:'KGL', dest:'DWC', std:'08:45', etd:'08:45', aircraft:'B737-800', cap:4500,  booked:2925,  status:'On Time',   region:'Gulf' },
  { flight:'WB204',  origin:'NBO', dest:'LHR', std:'22:15', etd:'22:15', aircraft:'A330-200', cap:14000, booked:13720, status:'On Time',   region:'Africa/Europe' },
  { flight:'WB205',  origin:'LHR', dest:'NBO', std:'09:00', etd:'09:00', aircraft:'A330-200', cap:14000, booked:8960,  status:'On Time',   region:'Europe/Africa' },
  { flight:'WB444',  origin:'KGL', dest:'ZNZ', std:'14:00', etd:'14:00', aircraft:'B737-800', cap:4500,  booked:1350,  status:'On Time',   region:'Africa' },
  { flight:'WB313',  origin:'JNB', dest:'KGL', std:'11:30', etd:'11:30', aircraft:'B737-800', cap:4500,  booked:3285,  status:'On Time',   region:'Africa' },
];

const STATION_OPTS = STATIONS.map(s =>
  `<option value="${s.code}">${s.code} — ${s.city}</option>`
).join('');

// ── Render ────────────────────────────────────────────────────────
function render() {
  const totalCap    = TODAY_FLIGHTS.reduce((s, f) => s + f.cap, 0);
  const totalBooked = TODAY_FLIGHTS.reduce((s, f) => s + f.booked, 0);
  const avail       = totalCap - totalBooked;
  const avgLF       = (totalBooked / totalCap * 100).toFixed(1);
  const todayBkgs   = BOOKINGS_DATA.filter(b => b.bookDate === '2026-03-11').length + 9;
  const todayRev    = BOOKINGS_DATA.filter(b => b.bookDate === '2026-03-11')
                        .reduce((s, b) => s + (b.charge || 0), 0) + 26840;
  const onTimeCount = TODAY_FLIGHTS.filter(f => f.status === 'On Time').length;
  const lfNum       = parseFloat(avgLF);

  return `
  <div class="page-wrap stagger">

    <!-- ── Page header ── -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">
          <div class="title-icon">${icon('search', 18)}</div>
          Space Search
        </h1>
        <div class="page-subtitle">
          <span class="live-dot"></span>
          Live belly capacity &mdash; ${formatDate(new Date(), 'short')}
          &middot; ${onTimeCount}/${TODAY_FLIGHTS.length} on time
        </div>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline btn-sm" onclick="spaceSearchRefresh()">
          ${icon('refresh', 13)} Refresh
        </button>
        <button class="btn btn-primary" onclick="openBookingModal()">
          ${icon('plus', 14)} New Booking
        </button>
      </div>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="kpi-grid kpi-grid-4">

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('package', 12)} Available Capacity</div>
        <div class="kpi-value">${formatNumber(avail)}<span class="kpi-unit" style="font-size:18px"> kg</span></div>
        <div class="kpi-delta up">${icon('arrow-up', 11)} Across ${TODAY_FLIGHTS.length} flights today</div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('bookings', 12)} Bookings Today</div>
        <div class="kpi-value">${todayBkgs}</div>
        <div class="kpi-delta up">${icon('trending-up', 11)} +3 vs yesterday</div>
      </div>

      <div class="kpi-card ${lfNum >= 80 ? 'kpi-green' : lfNum >= 65 ? 'kpi-amber' : 'kpi-red'}">
        <div class="kpi-label">${icon('activity', 12)} Avg. Load Factor</div>
        <div class="kpi-value">${avgLF}<span class="kpi-unit" style="font-size:18px">%</span></div>
        <div class="kpi-delta ${lfNum > 75 ? 'up' : 'down'}">
          ${lfNum > 75 ? icon('check-circle', 11) : icon('alert-circle', 11)}
          ${lfNum > 75 ? 'Above target' : 'Below 75% target'}
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${Math.min(lfNum, 100)}%"></div></div>
      </div>

      <div class="kpi-card kpi-gold">
        <div class="kpi-label">${icon('currency', 12)} Revenue Today</div>
        <div class="kpi-value">${formatNumber(todayRev, 'currency')}</div>
        <div class="kpi-delta up">${icon('trending-up', 11)} +8.4% vs last year</div>
      </div>

    </div>

    <!-- ── Quick Search Form ── -->
    <div class="card" style="margin-bottom:var(--sp-5)">
      <div class="card-header">
        <span class="card-title">${icon('filter', 15)} Quick Space Search</span>
        <span class="badge badge-live">Live</span>
      </div>
      <div class="card-body">
        <form id="ss-form" onsubmit="runSpaceSearch(event)"
              style="display:flex;flex-wrap:wrap;gap:var(--sp-3);align-items:flex-end">
          <div class="form-field" style="flex:1;min-width:130px">
            <label class="form-label">Origin</label>
            <select class="form-select" id="ss-origin">
              <option value="">Any Origin</option>
              ${STATION_OPTS}
            </select>
          </div>
          <div class="form-field" style="flex:1;min-width:130px">
            <label class="form-label">Destination</label>
            <select class="form-select" id="ss-dest">
              <option value="">Any Destination</option>
              ${STATION_OPTS}
            </select>
          </div>
          <div class="form-field" style="flex:0 0 150px">
            <label class="form-label">Aircraft Type</label>
            <select class="form-select" id="ss-ac">
              <option value="">All Aircraft</option>
              <option value="A330-200">A330-200 (Widebody)</option>
              <option value="B737-800">B737-800 (Narrowbody)</option>
            </select>
          </div>
          <div class="form-field" style="flex:0 0 120px">
            <label class="form-label">Min Avail (kg)</label>
            <input type="number" class="form-input" id="ss-minkg" min="0" placeholder="e.g. 500">
          </div>
          <div style="display:flex;gap:var(--sp-2)">
            <button type="submit" class="btn btn-primary">
              ${icon('search', 13)} Search
            </button>
            <button type="button" class="btn btn-outline"
                    onclick="document.getElementById('ss-form').reset();renderFlightTable(null)">
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── Flight Table + Chart ── -->
    <div style="display:grid;grid-template-columns:1fr 320px;gap:var(--sp-5);align-items:start">

      <div class="table-wrap">
        <div class="table-header">
          <span class="table-title">${icon('plane', 15)} Today's WB Flight Programme</span>
          <div style="display:flex;align-items:center;gap:var(--sp-3)">
            <span class="table-count" id="flight-count">${TODAY_FLIGHTS.length} flights</span>
            <button class="btn btn-outline btn-xs" onclick="exportFlightCSV()">
              ${icon('download', 11)} CSV
            </button>
          </div>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>STD&nbsp;/&nbsp;ETD</th>
                <th>Aircraft</th>
                <th class="td-right">Booked</th>
                <th class="td-right">Available</th>
                <th style="min-width:130px">Load Factor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="flights-tbody">
              ${TODAY_FLIGHTS.map(f => _flightRow(f)).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right panel: LF chart -->
      <div class="chart-container" style="position:sticky;top:var(--sp-6)">
        <div class="chart-header">
          <div>
            <div class="chart-title">Load Factor by Flight</div>
            <div class="chart-subtitle">Today's utilisation</div>
          </div>
        </div>
        <div style="height:300px;position:relative">
          <canvas id="ss-lf-chart"></canvas>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--sp-2);margin-top:var(--sp-3)">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--font-xs);color:var(--mid)">
            <span style="display:flex;align-items:center;gap:5px">
              <span style="width:10px;height:10px;background:var(--green);border-radius:2px;display:inline-block"></span> &lt;75%
            </span>
            <span style="display:flex;align-items:center;gap:5px">
              <span style="width:10px;height:10px;background:var(--amber);border-radius:2px;display:inline-block"></span> 75–90%
            </span>
            <span style="display:flex;align-items:center;gap:5px">
              <span style="width:10px;height:10px;background:var(--red);border-radius:2px;display:inline-block"></span> &gt;90%
            </span>
          </div>
          <div style="padding:10px 12px;background:var(--smoke);border-radius:var(--r-md);font-size:var(--font-sm)">
            <div style="font-weight:700;color:var(--heading)">Network Avg: ${avgLF}%</div>
            <div style="color:var(--mid);margin-top:2px">
              ${formatNumber(avail)} kg available across ${TODAY_FLIGHTS.length} flights
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>`;
}

// ── Flight row template ───────────────────────────────────────────
function _flightRow(f) {
  const avail = f.cap - f.booked;
  const lf    = Math.round(f.booked / f.cap * 100);
  const lfCls = lf >= 90 ? 'red' : lf >= 75 ? 'mid' : 'low';
  const lfBadgeCls = lf >= 90 ? 'badge-red' : lf >= 75 ? 'badge-amber' : 'badge-green';
  const isDelayed  = f.etd !== f.std;
  const stBadge    = f.status === 'On Time' ? 'badge-green' : f.status === 'Delayed' ? 'badge-amber' : 'badge-red';
  const acIcon     = f.aircraft === 'A330-200' ? '✈' : '🛫';
  const availColor = avail < 500 ? 'color:var(--red);font-weight:800' : avail < 2000 ? 'color:var(--amber);font-weight:700' : 'color:var(--green);font-weight:700';

  return `<tr>
    <td class="td-mono">${esc(f.flight)}</td>
    <td>
      <span style="font-weight:700;color:var(--heading)">${esc(f.origin)}</span>
      <span style="color:var(--mid);margin:0 4px">→</span>
      <span style="font-weight:700;color:var(--heading)">${esc(f.dest)}</span>
    </td>
    <td>
      <div style="font-family:var(--mono);font-weight:600">${esc(f.std)}</div>
      ${isDelayed ? `<div style="font-size:11px;color:var(--amber);font-weight:600">ETD ${esc(f.etd)}</div>` : ''}
    </td>
    <td>
      <span style="font-size:var(--font-xs);font-weight:600;color:var(--body)">${esc(f.aircraft)}</span>
    </td>
    <td class="td-right" style="font-family:var(--mono)">${formatNumber(f.booked)}</td>
    <td class="td-right" style="${availColor};font-family:var(--mono)">${formatNumber(avail)}</td>
    <td>
      <div class="lf-bar">
        <div class="lf-track">
          <div class="lf-fill lf-${lfCls}" style="width:${lf}%"></div>
        </div>
        <span class="lf-pct">${lf}%</span>
      </div>
    </td>
    <td><span class="badge ${stBadge}">${esc(f.status)}</span></td>
    <td>
      <div style="display:flex;gap:var(--sp-1)">
        <button class="btn btn-primary btn-xs" onclick="openBookingModal('${esc(f.flight)}')">
          Book
        </button>
        <button class="btn btn-ghost btn-xs" title="View details"
                onclick="showFlightDetail('${esc(f.flight)}','${esc(f.origin)}','${esc(f.dest)}',${avail})">
          ${icon('eye', 12)}
        </button>
      </div>
    </td>
  </tr>`;
}

// ── Init ──────────────────────────────────────────────────────────
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
        return lf >= 90 ? '#DC2626' : lf >= 75 ? '#D97706' : '#16A34A';
      }),
      borderRadius: 6,
      borderSkipped: false,
    }],
    {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          max: 100,
          ticks: { callback: v => v + '%', font: { size: 11 } },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, family: "'JetBrains Mono', monospace" } },
        },
      },
    }
  );

  // Global handlers
  window.spaceSearchRefresh = () => {
    showToast('Data refreshed', 'success', 'Live capacity data updated', 2000);
  };

  window.showFlightDetail = (flight, origin, dest, avail) => {
    showToast(
      `${flight} — ${origin} → ${dest}`,
      'info',
      `${formatNumber(avail)} kg available · Click "Book" to reserve`,
      4000
    );
  };

  window.exportFlightCSV = () => {
    showToast('Export started', 'success', 'Flight schedule CSV downloading…', 2000);
  };

  window.renderFlightTable = (filtered) => {
    const data = filtered || TODAY_FLIGHTS;
    const tbody = document.getElementById('flights-tbody');
    if (tbody) tbody.innerHTML = data.map(f => _flightRow(f)).join('');
    const cnt = document.getElementById('flight-count');
    if (cnt) cnt.textContent = `${data.length} flights`;
    if (data.length === 0) {
      if (tbody) tbody.innerHTML = `
        <tr><td colspan="9">
          <div class="empty-state" style="padding:var(--sp-8)">
            <div class="empty-icon">${icon('search', 28)}</div>
            <div class="empty-title">No flights match your search</div>
            <div class="empty-desc">Try adjusting your filters</div>
          </div>
        </td></tr>`;
    }
  };

  window.runSpaceSearch = (e) => {
    e.preventDefault();
    const origin = document.getElementById('ss-origin')?.value;
    const dest   = document.getElementById('ss-dest')?.value;
    const ac     = document.getElementById('ss-ac')?.value;
    const minKg  = parseFloat(document.getElementById('ss-minkg')?.value) || 0;
    let results  = [...TODAY_FLIGHTS];
    if (origin) results = results.filter(f => f.origin === origin);
    if (dest)   results = results.filter(f => f.dest   === dest);
    if (ac)     results = results.filter(f => f.aircraft === ac);
    if (minKg)  results = results.filter(f => (f.cap - f.booked) >= minKg);
    window.renderFlightTable(results);
    showToast(
      `${results.length} flight${results.length !== 1 ? 's' : ''} found`,
      results.length > 0 ? 'success' : 'warning',
      results.length > 0 ? `${formatNumber(results.reduce((s,f) => s + (f.cap - f.booked), 0))} kg total available` : 'Try adjusting your filters',
      2500
    );
  };
}

export const handler = { render, init };
