// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Temperature Control
// ═══════════════════════════════════════════════════════════════════

import { formatNumber, formatDate, formatAWB, esc } from '../utils/format.js';
import { buildLineChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

// Simulated temperature-controlled shipments
const TEMP_SHIPMENTS = [
  { awb:'459-66271704', desc:'Pharmaceutical — Vaccines',  type:'PHA', reqMin:2, reqMax:8,  currTemp:4.2,  station:'NBO', duration:18, flightOut:'WB711', status:'OK' },
  { awb:'459-64668321', desc:'Fresh Cut Flowers',          type:'PER', reqMin:2, reqMax:10, currTemp:6.8,  station:'KGL', duration:6,  flightOut:'WB700', status:'OK' },
  { awb:'459-64791101', desc:'Pharmaceutical — Biologics', type:'PHA', reqMin:2, reqMax:8,  currTemp:9.4,  station:'NBO', duration:31, flightOut:'WB204', status:'EXCURSION' },
  { awb:'459-66284112', desc:'Fresh Avocados — Export',    type:'PER', reqMin:5, reqMax:13, currTemp:10.1, station:'KGL', duration:4,  flightOut:'WB710', status:'OK' },
  { awb:'459-64792100', desc:'Live Day-Old Chicks',        type:'AVI', reqMin:25, reqMax:32, currTemp:28.5, station:'EBB', duration:9, flightOut:'WB452', status:'OK' },
  { awb:'459-66291340', desc:'Pharmaceuticals — Insulin',  type:'PHA', reqMin:2, reqMax:8,  currTemp:7.8,  station:'KGL', duration:22, flightOut:'WB710', status:'NEAR LIMIT' },
  { awb:'459-64793901', desc:'Fresh Mango Export',         type:'PER', reqMin:8, reqMax:16, currTemp:12.3, station:'KGL', duration:3,  flightOut:'WB700', status:'OK' },
  { awb:'459-66302145', desc:'Blood Plasma Samples',       type:'PHA', reqMin:-20, reqMax:-15, currTemp:-17.4, station:'KGL', duration:7, flightOut:'WB710', status:'OK' },
];

// Simulated 24hr temp log (per cool room)
const COOL_ROOMS = [
  {
    id:'KGL-CR1', name:'KGL Cool Room 1 (2–8°C)',
    labels: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    temps:  [5.1, 4.8, 4.6, 5.0, 5.3, 5.9, 6.1, 5.8, 5.5, 5.2, 4.9, 4.7],
    min:2, max:8, color:'#00529B'
  },
  {
    id:'NBO-CR1', name:'NBO Cool Room 1 (2–8°C)',
    labels: ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'],
    temps:  [5.4, 5.6, 5.9, 6.8, 7.9, 8.4, 9.1, 9.4, 8.7, 7.9, 7.1, 6.8],
    min:2, max:8, color:'#C0392B'
  },
];

function statusBadge(status) {
  if (status === 'OK') return `<span class="badge badge-green">OK</span>`;
  if (status === 'NEAR LIMIT') return `<span class="badge badge-amber">Near Limit</span>`;
  if (status === 'EXCURSION') return `<span class="badge badge-red">⚠ Excursion</span>`;
  return `<span class="badge">${status}</span>`;
}

function typeBadge(type) {
  const map = { PHA:'badge-blue', PER:'badge-green', AVI:'badge-gold' };
  const labels = { PHA:'Pharma', PER:'Perishable', AVI:'Live Animals' };
  return `<span class="badge ${map[type]||''}">${labels[type]||type}</span>`;
}

function tempColor(s) {
  return s === 'EXCURSION' ? '#C0392B' : s === 'NEAR LIMIT' ? '#D97706' : '#1A8A4A';
}

export function render() {
  const excursions = TEMP_SHIPMENTS.filter(s => s.status === 'EXCURSION').length;
  const nearLimit  = TEMP_SHIPMENTS.filter(s => s.status === 'NEAR LIMIT').length;
  const coolRoomsOcc = new Set(TEMP_SHIPMENTS.map(s => s.station)).size;

  const pharmaCount = TEMP_SHIPMENTS.filter(s=>s.type==='PHA').length;
  const perCount = TEMP_SHIPMENTS.filter(s=>s.type==='PER').length;

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('thermometer', 18)}</span>
        <div>
          <div class="portal-header-title">Temperature Control</div>
          <div class="portal-header-sub">Pharma &amp; perishable shipments · live monitoring · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" onclick="tempRefresh()">
          ${icon('refresh-cw', 13)} Refresh
        </button>
        ${excursions > 0 ? `
        <button class="btn btn-red btn-sm" onclick="tempEscalate()">
          ${icon('alert-triangle',13)} ${excursions} Excursion${excursions>1?'s':''}
        </button>` : ''}
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('package', 11)} Active Temp Shipments</div>
        <div class="kpi-value kpi-sm">${TEMP_SHIPMENTS.length}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('activity',12)} ${pharmaCount} pharma · ${perCount} perishable</span>
        </div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('thermometer', 11)} Cool Rooms Active</div>
        <div class="kpi-value kpi-sm">${coolRoomsOcc}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check',12)} Across ${coolRoomsOcc} stations</span>
        </div>
      </div>

      <div class="kpi-card ${excursions > 0 ? 'kpi-red' : 'kpi-green'}">
        <div class="kpi-label">${icon('alert-circle', 11)} Temp Excursions (24hr)</div>
        <div class="kpi-value kpi-sm">${excursions}</div>
        <div class="kpi-footer">
          <span class="kpi-delta ${excursions>0?'down':'up'}">${excursions>0?icon('alert-circle',12)+' Immediate QA action needed':icon('check',12)+' All within range'}</span>
        </div>
      </div>

      <div class="kpi-card ${nearLimit > 0 ? 'kpi-amber' : 'kpi-navy'}">
        <div class="kpi-label">${icon('clock', 11)} Near-Limit Alerts</div>
        <div class="kpi-value kpi-sm">${nearLimit}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('eye',12)} Monitor closely</span>
        </div>
      </div>

    </div>

    <!-- Cool Room Temp Charts -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      ${COOL_ROOMS.map(cr => `
        <div class="card">
          <div class="card-header">
            <span class="card-title">${cr.name}</span>
            <span class="badge ${cr.temps[cr.temps.length-1] > cr.max ? 'badge-red' : 'badge-green'}">
              Current: ${cr.temps[cr.temps.length-1]}°C
            </span>
          </div>
          <div class="card-body">
            <div class="chart-wrap" style="height:140px">
              <canvas id="temp-chart-${cr.id}"></canvas>
            </div>
            <div style="font-size:11px;color:var(--mid);margin-top:8px">
              Target range: ${cr.min}°C – ${cr.max}°C &nbsp;|&nbsp; 24-hour trend
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Shipments Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Temperature-Controlled Shipments</span>
        <div class="filter-bar" style="gap:8px">
          <select class="form-select" onchange="tempFilterType(this.value)" style="width:140px">
            <option value="">All Types</option>
            <option value="PHA">Pharma</option>
            <option value="PER">Perishable</option>
            <option value="AVI">Live Animals</option>
          </select>
          <select class="form-select" onchange="tempFilterStation(this.value)" style="width:120px">
            <option value="">All Stations</option>
            <option value="KGL">KGL</option>
            <option value="NBO">NBO</option>
            <option value="EBB">EBB</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table id="temp-table">
          <thead>
            <tr>
              <th>AWB</th>
              <th>Description</th>
              <th>Type</th>
              <th>Required Range</th>
              <th>Current Temp</th>
              <th>Duration</th>
              <th>Station</th>
              <th>Next Flight</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${TEMP_SHIPMENTS.map(s => `
              <tr>
                <td><code style="font-size:12px">${formatAWB(s.awb)}</code></td>
                <td>${esc(s.desc)}</td>
                <td>${typeBadge(s.type)}</td>
                <td style="font-size:12px;color:var(--mid)">${s.reqMin}°C – ${s.reqMax}°C</td>
                <td><strong style="color:${tempColor(s.status)}">${s.currTemp}°C</strong></td>
                <td>${s.duration}hr</td>
                <td><span class="badge badge-blue">${s.station}</span></td>
                <td style="font-size:12px;font-weight:600">${esc(s.flightOut)}</td>
                <td>${statusBadge(s.status)}</td>
                <td>
                  <div class="row-actions">
                    ${s.status === 'EXCURSION' ? `<button class="btn btn-danger btn-sm" onclick="tempEscalateShipment('${s.awb}')">QA Alert</button>` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="tempViewLog('${s.awb}')">Log</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

export function init(container) {
  // Render cool room charts
  COOL_ROOMS.forEach(cr => {
    const canvas = container.querySelector(`#temp-chart-${cr.id}`);
    if (!canvas || !window.Chart) return;

    const isExcursion = cr.temps.some(t => t > cr.max || t < cr.min);
    buildLineChart(`temp-chart-${cr.id}`, cr.labels,
      [
        {
          label: 'Temperature (°C)',
          data: cr.temps,
          borderColor: cr.color,
          backgroundColor: cr.color + '22',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: `Max (${cr.max}°C)`,
          data: Array(cr.labels.length).fill(cr.max),
          borderColor: '#C0392B',
          borderDash: [5,5],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        },
        {
          label: `Min (${cr.min}°C)`,
          data: Array(cr.labels.length).fill(cr.min),
          borderColor: '#1EA2DC',
          borderDash: [5,5],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        }
      ],
      { plugins: { legend: { display: false } } }
    );
  });

  // Global handlers
  window.tempRefresh = () => showToast('Temperature data refreshed', 'success', 'All sensors polled', 2000);
  window.tempEscalate = () => showToast('QA Escalation sent', 'warning', 'Station managers notified of excursions', 4000);
  window.tempEscalateShipment = (awb) => showToast(`QA Alert raised — ${formatAWB(awb)}`, 'error', 'Assigned to Station Manager. SLA breach logged.', 5000);
  window.tempViewLog = (awb) => showToast(`Temperature log — ${formatAWB(awb)}`, 'info', 'Full 48hr log available in Station Reports', 3000);
  window.tempFilterType = (v) => showToast('Filter applied', 'info', `Showing: ${v || 'All types'}`, 1500);
  window.tempFilterStation = (v) => showToast('Filter applied', 'info', `Station: ${v || 'All stations'}`, 1500);
}

export const handler = { render, init };
