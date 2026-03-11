// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Dwell Alerts Page
// Stats cards, table, station heatmap, trend chart, bulk escalation
// ═══════════════════════════════════════════════════════════════════

import { STATIONS } from '../data/stations.js';
import { formatDwell, esc, formatDate } from '../utils/format.js';
import { barChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

const DWELL_DATA = [
  { awb:'459-66271704', station:'NBO', commodity:'Pharma (PIL)', weight:320, dwellMin:3080, sla:2880, handler:'East Africa Cargo', flight:'WB204', origin:'LOS', dest:'LHR', assignee:'J. Kamau', severity:'critical' },
  { awb:'459-64668321', station:'ADD', commodity:'DG Class 3', weight:185, dwellMin:2340, sla:2880, handler:'Horn of Africa', flight:'WB701', origin:'ADD', dest:'KGL', assignee:'F. Osei', severity:'warning' },
  { awb:'459-64791101', station:'NBO', commodity:'Perishables', weight:1240, dwellMin:1420, sla:2160, handler:'East Africa Cargo', flight:'WB204', origin:'NBO', dest:'LHR', assignee:'M. Wanjiru', severity:'warning' },
  { awb:'459-64788636', station:'JNB', commodity:'Auto Parts', weight:890, dwellMin:1840, sla:2880, handler:'Bidair JNB', flight:'WB312', origin:'JNB', dest:'LHR', assignee:'J. Kamau', severity:'warning' },
  { awb:'459-64772050', station:'KGL', commodity:'Electronics', weight:480, dwellMin:920, sla:2880, handler:'RwandAir Direct', flight:'WB622', origin:'KGL', dest:'DXB', assignee:'A. Ndayishimiye', severity:'ok' },
  { awb:'459-64809765', station:'DWC', commodity:'General Cargo', weight:45, dwellMin:760, sla:1440, handler:'AL RAIS CARGO', flight:'WB9316', origin:'DWC', dest:'KGL', assignee:'F. Osei', severity:'ok' },
  { awb:'459-64821455', station:'NBO', commodity:'Tobacco Leaf', weight:2100, dwellMin:1600, sla:2880, handler:'Dar Freight', flight:'WB204', origin:'DAR', dest:'CDG', assignee:'M. Wanjiru', severity:'warning' },
];

let _selected = new Set();

export function render() {
  const critical = DWELL_DATA.filter(d => d.dwellMin > d.sla).length;
  const warning = DWELL_DATA.filter(d => d.dwellMin > d.sla * 0.75 && d.dwellMin <= d.sla).length;
  const ok = DWELL_DATA.filter(d => d.dwellMin <= d.sla * 0.75).length;
  const totalKg = DWELL_DATA.reduce((s, d) => s + d.weight, 0);

  // Station heatmap data
  const stationCounts = {};
  DWELL_DATA.forEach(d => { stationCounts[d.station] = (stationCounts[d.station] || 0) + 1; });
  const alertStations = STATIONS.filter(s => s.dwellAlerts > 0);

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('alert-triangle', 18)}</span>
        <div>
          <div class="portal-header-title">Dwell Alerts</div>
          <div class="portal-header-sub">SLA breach monitoring · ${DWELL_DATA.length} shipments · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" id="bulk-esc-btn" style="display:none" onclick="bulkEscalate()">
          ${icon('alert-triangle',13)} Escalate Selected
        </button>
        <button class="btn btn-pri btn-sm" onclick="dwellExport()">
          ${icon('download', 13)} Export Report
        </button>
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-red">
        <div class="kpi-label">${icon('alert-circle', 11)} SLA Breached</div>
        <div class="kpi-value kpi-sm">${critical}</div>
        <div class="kpi-footer">
          <span class="kpi-delta down">${icon('clock',12)} Immediate action required</span>
        </div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-label">${icon('clock', 11)} Approaching SLA</div>
        <div class="kpi-value kpi-sm">${warning}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('activity',12)} &gt;75% of threshold</span>
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('check-circle', 11)} Within SLA</div>
        <div class="kpi-value kpi-sm">${ok}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check',12)} On schedule</span>
        </div>
      </div>

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('package', 11)} kg Affected</div>
        <div class="kpi-value kpi-sm">${totalKg.toLocaleString()}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('map-pin',12)} Across all stations</span>
        </div>
      </div>

    </div>

  <div class="two-col-layout">
    <!-- Table -->
    <div class="card" style="flex:2">
      <div class="card-header-row">
        <h3>Dwell Exceptions</h3>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th><input type="checkbox" onclick="dwellSelectAll(this)"></th>
            <th>AWB</th><th>Station</th><th>Commodity</th>
            <th>Dwell Time</th><th>SLA</th><th>% of SLA</th>
            <th>Next Flight</th><th>Assignee</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${DWELL_DATA.map(d => {
            const pct = Math.round((d.dwellMin / d.sla) * 100);
            const slaMins = Math.floor(d.sla / 60);
            const color = pct > 100 ? 'var(--red)' : pct > 75 ? 'var(--amber)' : 'var(--green)';
            return `
            <tr class="table-row">
              <td><input type="checkbox" onchange="dwellToggle('${esc(d.awb)}',this.checked)"></td>
              <td class="mono text-sm">${esc(d.awb)}</td>
              <td><strong>${esc(d.station)}</strong></td>
              <td class="text-sm">${esc(d.commodity)}</td>
              <td>${formatDwell(d.dwellMin)}</td>
              <td class="text-mid">${slaMins}hr</td>
              <td>
                <div class="progress-bar-wrap">
                  <div class="progress-bar" style="width:${Math.min(pct,100)}%;background:${color}"></div>
                </div>
                <span class="text-sm" style="color:${color}">${pct}%</span>
              </td>
              <td class="mono text-sm">${esc(d.flight)}</td>
              <td class="text-sm">${esc(d.assignee)}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="escalateDwell('${esc(d.awb)}')">Escalate</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Station heatmap + chart -->
    <div style="flex:1;display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <div class="card-header-row"><h3>Station Heatmap</h3></div>
        <div class="station-heatmap">
          ${STATIONS.filter(s => s.dwellAlerts > 0).map(s => `
            <div class="heatmap-cell" style="background:${s.dwellAlerts > 3 ? 'var(--red)' : s.dwellAlerts > 1 ? 'var(--amber)' : 'var(--gold)'}20;border:1px solid ${s.dwellAlerts > 3 ? 'var(--red)' : s.dwellAlerts > 1 ? 'var(--amber)' : 'var(--gold)'}">
              <div class="heatmap-station">${s.code}</div>
              <div class="heatmap-count" style="color:${s.dwellAlerts > 3 ? 'var(--red)' : 'var(--amber)'}">${s.dwellAlerts}</div>
              <div class="heatmap-label">${s.city}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header-row"><h3>7-Day Dwell Trend</h3></div>
        <div style="height:180px">
          <canvas id="dwell-trend-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
  </div>`;
}

export function init(container) {
  barChart('dwell-trend-chart',
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    [{
      label: 'Avg Dwell (hrs)',
      data: [28, 32, 41, 38, 45, 29, 35],
      backgroundColor: 'var(--amber)',
      borderRadius: 4,
    }],
    { legend: false }
  );

  window.dwellExport = () => {
    showToast('Exporting…', 'info');
    setTimeout(() => showToast('Dwell report downloaded', 'success'), 1600);
  };
}

window.dwellToggle = function(awb, checked) {
  if (checked) _selected.add(awb); else _selected.delete(awb);
  const btn = document.getElementById('bulk-esc-btn');
  if (btn) btn.style.display = _selected.size > 0 ? 'inline-flex' : 'none';
};

window.dwellSelectAll = function(cb) {
  if (cb.checked) DWELL_DATA.forEach(d => _selected.add(d.awb));
  else _selected.clear();
  document.querySelectorAll('.data-table input[type=checkbox]:not([onclick])').forEach(c => c.checked = cb.checked);
  const btn = document.getElementById('bulk-esc-btn');
  if (btn) btn.style.display = _selected.size > 0 ? 'inline-flex' : 'none';
};

window.escalateDwell = function(awb) {
  showToast('Escalated to station manager', 'warning', `${awb} — priority alert sent`, 4000);
};

window.bulkEscalate = function() {
  const n = _selected.size;
  showToast(`${n} shipment${n>1?'s':''} escalated`, 'warning', 'Station managers and ops director notified', 5000);
  _selected.clear();
  document.querySelectorAll('.data-table input[type=checkbox]').forEach(c => c.checked = false);
  const btn = document.getElementById('bulk-esc-btn');
  if (btn) btn.style.display = 'none';
};

export const handler = { render, init };
