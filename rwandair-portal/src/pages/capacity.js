// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Capacity Planning
// ═══════════════════════════════════════════════════════════════════

import { FLIGHTS, ROUTES, AIRCRAFT_CAPACITY } from '../data/flights.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';

// 7-day forward view (from today Mar 11, 2026)
const DAYS = ['Wed Mar 11','Thu Mar 12','Fri Mar 13','Sat Mar 14','Sun Mar 15','Mon Mar 16','Tue Mar 17'];

// Representative capacity by day (all routes combined, in tonnes)
const DAY_CAPACITY = [
  { day:'Wed Mar 11', totalCap:142.5, booked:113.2, blocked:6.4 },
  { day:'Thu Mar 12', totalCap:138.0, booked:108.9, blocked:4.2 },
  { day:'Fri Mar 13', totalCap:146.5, booked:122.8, blocked:8.1 },
  { day:'Sat Mar 14', totalCap:124.0, booked:89.4,  blocked:3.8 },
  { day:'Sun Mar 15', totalCap:128.0, booked:96.3,  blocked:5.2 },
  { day:'Mon Mar 16', totalCap:142.5, booked:118.7, blocked:6.9 },
  { day:'Tue Mar 17', totalCap:138.0, booked:105.4, blocked:4.6 },
];

// Flight capacity table
const FLIGHT_CAP = [
  { flight:'WB710',  route:'KGL→LHR', aircraft:'A330-200', cap:14000, booked:10290, blocked:0,   std:'22:40', status:'On Time' },
  { flight:'WB711',  route:'LHR→KGL', aircraft:'A330-200', cap:14000, booked:11480, blocked:500, std:'20:30', status:'On Time' },
  { flight:'WB700',  route:'KGL→CDG', aircraft:'A330-200', cap:14000, booked:9940,  blocked:0,   std:'00:05', status:'On Time' },
  { flight:'WB701',  route:'CDG→KGL', aircraft:'A330-200', cap:14000, booked:13440, blocked:200, std:'10:15', status:'Delayed' },
  { flight:'WB9316', route:'DWC→KGL', aircraft:'B737-800', cap:4500,  booked:3555,  blocked:0,   std:'01:30', status:'On Time' },
  { flight:'WB9317', route:'KGL→DWC', aircraft:'B737-800', cap:4500,  booked:2925,  blocked:0,   std:'08:45', status:'On Time' },
  { flight:'WB304',  route:'KGL→DXB', aircraft:'B737-800', cap:4500,  booked:3780,  blocked:120, std:'22:10', status:'On Time' },
  { flight:'WB305',  route:'DXB→KGL', aircraft:'B737-800', cap:4500,  booked:4050,  blocked:0,   std:'06:20', status:'On Time' },
  { flight:'WB202',  route:'KGL→LOS', aircraft:'A330-200', cap:14000, booked:10920, blocked:400, std:'17:30', status:'On Time' },
  { flight:'WB452',  route:'KGL→NBO', aircraft:'Q400',     cap:1500,  booked:1020,  blocked:0,   std:'08:10', status:'On Time' },
  { flight:'WB434',  route:'KGL→EBB', aircraft:'B737-800', cap:4500,  booked:3735,  blocked:0,   std:'07:00', status:'On Time' },
];

function loadColor(pct) {
  return pct > 90 ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--green)';
}

export function render() {
  const totalCap    = FLIGHT_CAP.reduce((s,f) => s + f.cap, 0);
  const totalBooked = FLIGHT_CAP.reduce((s,f) => s + f.booked, 0);
  const totalAvail  = totalCap - totalBooked;
  const avgLoad     = (totalBooked / totalCap * 100).toFixed(1);
  const weekCap     = DAY_CAPACITY.reduce((s,d) => s + d.totalCap, 0);
  const weekBooked  = DAY_CAPACITY.reduce((s,d) => s + d.booked, 0);

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">✈️ Capacity Planning</h1>
        <p class="page-sub">7-day forward belly capacity — ${FLIGHT_CAP.length} active flights today</p>
      </div>
      <div class="page-actions">
        <select class="form-select" style="width:160px" onchange="capFilterRoute(this.value)">
          <option value="">All Routes</option>
          ${ROUTES.slice(0,10).map(r=>`<option value="${r.id}">${r.label}</option>`).join('')}
        </select>
        <button class="btn btn-sec" onclick="capExport()">⬇ Export LDM</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Weekly Network Capacity</div>
        <div class="kpi-value">${formatNumber(weekCap)} t</div>
        <div class="kpi-delta">7-day forward view</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Weekly Booked</div>
        <div class="kpi-value">${formatNumber(weekBooked)} t</div>
        <div class="kpi-delta delta-up">${(weekBooked/weekCap*100).toFixed(1)}% utilization</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Available Today</div>
        <div class="kpi-value">${formatNumber(totalAvail)} kg</div>
        <div class="kpi-delta">Across ${FLIGHT_CAP.length} flights</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Load Factor</div>
        <div class="kpi-value" style="color:${parseFloat(avgLoad)>85?'var(--red)':parseFloat(avgLoad)>70?'var(--amber)':'var(--green)'}">${avgLoad}%</div>
        <div class="kpi-delta">Target: 75%+</div>
      </div>
    </div>

    <!-- 7-Day Stacked Bar Chart -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <span class="card-title">7-Day Capacity Overview (tonnes)</span>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="height:220px">
          <canvas id="cap-weekly-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Flight Capacity Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Flight Capacity — Today</span>
        <div class="filter-bar">
          <select class="form-select" style="width:120px" onchange="capFilterAircraft(this.value)">
            <option value="">All Aircraft</option>
            <option value="A330-200">A330-200</option>
            <option value="B737-800">B737-800</option>
            <option value="Q400">Q400</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table id="cap-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Aircraft</th>
              <th>STD</th>
              <th>Total Cap (kg)</th>
              <th>Booked (kg)</th>
              <th>Available (kg)</th>
              <th>Load Factor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${FLIGHT_CAP.map(f => {
              const load = (f.booked / f.cap * 100).toFixed(1);
              const avail = f.cap - f.booked - f.blocked;
              return `
              <tr>
                <td><strong>${esc(f.flight)}</strong></td>
                <td>${esc(f.route)}</td>
                <td><span class="badge">${esc(f.aircraft)}</span></td>
                <td>${f.std}</td>
                <td>${formatNumber(f.cap)}</td>
                <td>${formatNumber(f.booked)}</td>
                <td><strong style="color:${avail<500?'var(--red)':avail<2000?'var(--amber)':'var(--green)'}">${formatNumber(avail)}</strong></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:80px;height:6px;background:var(--border);border-radius:3px">
                      <div style="width:${load}%;height:6px;background:${loadColor(parseFloat(load))};border-radius:3px"></div>
                    </div>
                    <span style="font-weight:700;font-size:12px;color:${loadColor(parseFloat(load))}">${load}%</span>
                  </div>
                </td>
                <td><span class="badge ${f.status==='Delayed'?'badge-amber':'badge-green'}">${f.status}</span></td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" onclick="capViewBookings('${f.flight}')">Bookings</button>
                    <button class="btn btn-ghost btn-sm" onclick="capPrintLDM('${f.flight}')">LDM</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

export function init(container) {
  // 7-day stacked bar
  buildBarChart('cap-weekly-chart',
    DAY_CAPACITY.map(d => d.day),
    [
      { label:'Booked (t)',    data: DAY_CAPACITY.map(d => d.booked),    backgroundColor:'#00529B' },
      { label:'Available (t)', data: DAY_CAPACITY.map(d => d.totalCap - d.booked - d.blocked), backgroundColor:'#94C943' },
      { label:'Blocked (t)',   data: DAY_CAPACITY.map(d => d.blocked),   backgroundColor:'#C0392B' },
    ],
    { plugins:{ tooltip:{ mode:'index' } } }
  );

  window.capFilterRoute    = (v) => showToast('Route filter', 'info', v || 'All routes', 1500);
  window.capFilterAircraft = (v) => showToast('Aircraft filter', 'info', v || 'All types', 1500);
  window.capExport         = () => showToast('LDM exported', 'success', 'Load distribution message downloaded', 2000);
  window.capViewBookings   = (f) => showToast(`Bookings — ${f}`, 'info', 'Full booking list available in Bookings page', 2000);
  window.capPrintLDM       = (f) => { showToast(`LDM — ${f}`, 'info', 'Printing LDM…', 2000); setTimeout(window.print, 500); };
}

export const handler = { render, init };
