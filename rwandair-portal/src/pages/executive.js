// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Executive Dashboard
// Management-level KPIs · Revenue · Load Factor · Alerts
// ═══════════════════════════════════════════════════════════════════

import { FY_TOTAL_TARGET, getTopMarkets } from '../data/revenue.js';
import { GSAS } from '../data/gsas.js';
import { NOTIFICATIONS } from '../data/notifications.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildLineChart, buildBarChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

// Executive-level KPIs (Dec 2025 actuals + current month)
const EXEC_DATA = {
  mtdRevenue:      2_841_200,
  mtdTarget:       2_783_086,
  ytdRevenue:      18_620_400,
  fyTarget:        FY_TOTAL_TARGET,
  netLoadFactor:   79.2,
  lfVsLY:          '+3.1pp',
  activeShipments: 1284,
  dwellAlerts:     8,
  cassOutstanding: GSAS.reduce((s, g) => s + (g.cassBalance || 0), 0),
};

// 12-month revenue vs target
const MONTHS_12 = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26'];
const ACTUAL_12 = [1920000,2050000,2180000,2340000,2290000,2750000,2180000,2070000,2841200,null,null,null];
const TARGET_12 = [1890000,2020000,2140000,2280000,2210000,2783086,2140000,2050000,2783086,2900000,2950000,3150000];

// Top 5 routes by revenue
const TOP_ROUTES = [
  { route: 'DXB → KGL', rev: 731_398 },
  { route: 'KGL → LHR', rev: 612_540 },
  { route: 'KGL → LOS', rev: 428_190 },
  { route: 'KGL → CDG', rev: 318_760 },
  { route: 'KGL → NBO', rev: 284_100 },
];

// Top 5 stations
const TOP_STATIONS = [
  { code:'KGL', city:'Kigali',  rev:1_240_000, load:78.4, trend:[980,1050,1120,1180,1220,1240] },
  { code:'DXB', city:'Dubai',   rev:731_398,   load:83.2, trend:[620,660,690,710,720,731]  },
  { code:'LHR', city:'London',  rev:612_540,   load:74.3, trend:[580,590,599,604,610,613]  },
  { code:'LOS', city:'Lagos',   rev:428_190,   load:76.8, trend:[380,395,410,418,424,428]  },
  { code:'NBO', city:'Nairobi', rev:284_100,   load:68.5, trend:[240,255,268,278,282,284]  },
];

function attainPct(actual, target) {
  return (actual / target * 100).toFixed(1);
}

function criticalNotifs() {
  return NOTIFICATIONS.filter(n => n.severity === 'critical').slice(0, 5);
}

function alertIcon(type) {
  if (type === 'DWELL')   return icon('clock', 14, 'text-amber');
  if (type === 'ALERT')   return icon('alert-triangle', 14, 'text-red');
  return icon('file-text', 14, 'text-mid');
}

export function render() {
  const attain    = attainPct(EXEC_DATA.mtdRevenue, EXEC_DATA.mtdTarget);
  const ytdAttain = attainPct(EXEC_DATA.ytdRevenue, EXEC_DATA.fyTarget * (9 / 12));
  const fyPct     = attainPct(EXEC_DATA.ytdRevenue, EXEC_DATA.fyTarget);
  const crits     = criticalNotifs();

  const cassHigh   = EXEC_DATA.cassOutstanding > 800_000;
  const dwellHigh  = EXEC_DATA.dwellAlerts > 5;

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('briefcase', 18)}</span>
        <div>
          <div class="portal-header-title">Executive Dashboard</div>
          <div class="portal-header-sub">FY 2025-26 · RwandAir Cargo · Network Overview · ${formatDate(new Date(), 'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <span class="badge-live">${icon('activity', 12)} Live</span>
        <button class="btn btn-ghost btn-sm" onclick="window.print()">
          ${icon('printer', 13)} Print Report
        </button>
        <button class="btn btn-sec btn-sm" onclick="window.exportExecReport()">
          ${icon('download', 13)} Export
        </button>
      </div>
    </div>

    <!-- ── 5-KPI Strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger">

      <div class="kpi-card kpi-navy" onclick="navigate('commercial')" title="View Commercial Dashboard">
        <div class="kpi-label">Network Revenue MTD</div>
        <div class="kpi-value">${formatNumber(EXEC_DATA.mtdRevenue, 'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('trending-up', 12)} ${attain}% of target</span>
          <span class="kpi-link-hint">${icon('arrow-right', 10)}</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${Math.min(parseFloat(attain),100)}%"></div></div>
      </div>

      <div class="kpi-card kpi-green" onclick="navigate('yield')" title="View Yield Analysis">
        <div class="kpi-label">Network Load Factor</div>
        <div class="kpi-value">${EXEC_DATA.netLoadFactor}%</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('trending-up', 12)} ${EXEC_DATA.lfVsLY} vs LY</span>
          <span class="kpi-link-hint">${icon('arrow-right', 10)}</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${EXEC_DATA.netLoadFactor}%"></div></div>
      </div>

      <div class="kpi-card kpi-teal" onclick="navigate('tracking')" title="View Shipment Tracking">
        <div class="kpi-label">Active Shipments</div>
        <div class="kpi-value">${formatNumber(EXEC_DATA.activeShipments)}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('package', 12)} In transit &amp; warehouse</span>
          <span class="kpi-link-hint">${icon('arrow-right', 10)}</span>
        </div>
      </div>

      <div class="kpi-card ${dwellHigh ? 'kpi-red' : 'kpi-amber'}" onclick="navigate('dwell-alerts')" title="View Dwell Alerts">
        <div class="kpi-label">Dwell Alerts</div>
        <div class="kpi-value">${EXEC_DATA.dwellAlerts}</div>
        <div class="kpi-footer">
          <span class="kpi-delta ${dwellHigh ? 'down' : ''}">${icon('alert-triangle', 12)} SLA breaches</span>
          <span class="kpi-link-hint">${icon('arrow-right', 10)}</span>
        </div>
      </div>

      <div class="kpi-card ${cassHigh ? 'kpi-red' : 'kpi-purple'}" onclick="navigate('gsa-performance')" title="View GSA Performance">
        <div class="kpi-label">CASS Outstanding</div>
        <div class="kpi-value">${formatNumber(EXEC_DATA.cassOutstanding, 'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta ${cassHigh ? 'down' : ''}">${icon('credit-card', 12)} GSA receivables</span>
          <span class="kpi-link-hint">${icon('arrow-right', 10)}</span>
        </div>
      </div>

    </div>

    <!-- ── Revenue Chart + Top Routes ─────────────────────────────── -->
    <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px">

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('bar-chart', 14)} Revenue vs Target — FY 2025-26</span>
          <span style="font-size:12px;color:var(--mid)">YTD: <strong style="color:var(--dark)">${formatNumber(EXEC_DATA.ytdRevenue, 'currency')}</strong> · ${ytdAttain}% of pro-rata</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:230px">
            <canvas id="exec-rev-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('map-pin', 14)} Top 5 Routes by Revenue</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:230px">
            <canvas id="exec-routes-chart"></canvas>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Top Stations + Critical Alerts ─────────────────────────── -->
    <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px">

      <!-- Stations -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('globe', 14)} Top Performing Stations</span>
          <a href="#network" class="card-link">${icon('arrow-right', 12)} Network map</a>
        </div>
        <div class="card-body" style="padding:12px 16px">
          <div style="display:flex;flex-direction:column;gap:8px">
            ${TOP_STATIONS.map((s, i) => `
              <div class="station-card">
                <span class="station-rank">${i + 1}</span>
                <div class="station-iata">${esc(s.code)}</div>
                <div class="station-info">
                  <div class="station-city">${esc(s.city)}</div>
                  <div class="station-meta">LF ${s.load}%</div>
                </div>
                <div class="station-chart">
                  <canvas id="exec-spark-${s.code}" width="72" height="26"></canvas>
                </div>
                <div class="station-rev">
                  <div class="station-rev-val">${formatNumber(s.rev, 'currency')}</div>
                  <div class="station-rev-lf">
                    <div class="lf-bar" style="width:80px">
                      <div class="lf-track">
                        <div class="lf-fill ${s.load >= 85 ? 'lf-over' : s.load >= 75 ? 'lf-high' : s.load >= 60 ? 'lf-mid' : 'lf-low'}" style="width:${s.load}%"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Critical Alerts -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('alert-circle', 14)} Critical Alerts</span>
          <a href="#dwell-alerts" class="card-link">${icon('arrow-right', 12)} View all</a>
        </div>
        <div class="card-body" style="padding:0">
          ${crits.length === 0
            ? `<div style="text-align:center;padding:48px 24px;color:var(--mid)">
                <div style="margin-bottom:8px;color:var(--green)">${icon('check-circle', 32)}</div>
                <div style="font-size:13px;font-weight:500">No critical alerts</div>
              </div>`
            : crits.map(n => `
              <div class="alert-row" onclick="window.location.hash='${n.link.slice(1)}'">
                <span class="alert-row-icon">${alertIcon(n.type)}</span>
                <div class="alert-row-body">
                  <div class="alert-row-title">${esc(n.title)}</div>
                  <div class="alert-row-msg">${esc(n.message.slice(0, 90))}…</div>
                  <div class="alert-row-meta">
                    <span class="badge badge-red badge-sm">Critical</span>
                    <span>${icon('map-pin', 10)} ${n.station}</span>
                  </div>
                </div>
              </div>
            `).join('')
          }
        </div>
      </div>

    </div>

    <!-- ── FY Progress ─────────────────────────────────────────────── -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-body" style="padding:16px 20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--dark)">FY 2025-26 Revenue Progress</div>
            <div style="font-size:12px;color:var(--mid);margin-top:2px">
              ${formatNumber(EXEC_DATA.ytdRevenue, 'currency')} of ${formatNumber(FY_TOTAL_TARGET, 'currency')} target
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:800;color:var(--green)">${fyPct}%</div>
            <div style="font-size:11px;color:var(--mid)">9 of 12 months</div>
          </div>
        </div>
        <div class="progress-track" style="height:10px">
          <div class="progress-fill gradient" style="width:${fyPct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--mid)">
          <span>Jul 2025</span>
          <span style="color:var(--portal-primary);font-weight:600">← 3 months remaining →</span>
          <span>Jun 2026</span>
        </div>
      </div>
    </div>

  </div>`;
}

export function init(container) {
  // Revenue vs target line chart
  buildLineChart('exec-rev-chart', MONTHS_12, [
    {
      label: 'Actual Revenue',
      data: ACTUAL_12,
      borderColor: 'var(--portal-primary, #00529B)',
      backgroundColor: 'rgba(0,82,155,0.08)',
      fill: true,
      tension: 0.35,
      spanGaps: false,
      pointRadius: 3,
      pointHoverRadius: 5,
    },
    {
      label: 'Target',
      data: TARGET_12,
      borderColor: '#FEE014',
      borderDash: [6, 3],
      pointRadius: 2,
      fill: false,
      tension: 0.2,
    },
  ]);

  // Top routes horizontal bar
  buildBarChart(
    'exec-routes-chart',
    TOP_ROUTES.map(r => r.route),
    [{ label: 'Revenue MTD ($)', data: TOP_ROUTES.map(r => r.rev), backgroundColor: '#1EA2DC', borderRadius: 4 }],
    { indexAxis: 'y', plugins: { legend: { display: false } } }
  );

  // Station sparklines
  TOP_STATIONS.forEach(s => {
    const canvas = container.querySelector(`#exec-spark-${s.code}`);
    if (!canvas || !window.Chart) return;
    try {
      new window.Chart(canvas, {
        type: 'line',
        data: {
          labels: s.trend.map((_, i) => i),
          datasets: [{
            data: s.trend,
            borderColor: '#00529B',
            borderWidth: 1.5,
            pointRadius: 0,
            fill: true,
            backgroundColor: 'rgba(0,82,155,0.08)',
            tension: 0.4,
          }]
        },
        options: {
          animation: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          responsive: false,
          maintainAspectRatio: false,
        },
      });
    } catch (e) { /* already mounted */ }
  });
}

// Export report handler
window.exportExecReport = function() {
  showToast('Generating executive report…', 'info');
  setTimeout(() => showToast('Executive report downloaded (PDF)', 'success'), 1600);
};

export const handler = { render, init };
