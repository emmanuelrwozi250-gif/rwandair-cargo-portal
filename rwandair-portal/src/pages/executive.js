// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Executive Dashboard
// ═══════════════════════════════════════════════════════════════════

import { FY_TOTAL_TARGET, getTopMarkets } from '../data/revenue.js';
import { GSAS } from '../data/gsas.js';
import { NOTIFICATIONS } from '../data/notifications.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildLineChart, buildBarChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';

// Executive-level KPIs (Dec 2025 actuals + current month)
const EXEC_DATA = {
  mtdRevenue:     2_841_200,
  mtdTarget:      2_783_086,
  ytdRevenue:     18_620_400,
  fyTarget:       FY_TOTAL_TARGET,
  netLoadFactor:  79.2,
  activeShipments:1284,
  dwellAlerts:    8,
  cassOutstanding: GSAS.reduce((s,g) => s + (g.cassBalance||0), 0),
};

// 12-month revenue vs target
const MONTHS_12     = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26'];
const ACTUAL_12     = [1920000,2050000,2180000,2340000,2290000,2750000,2180000,2070000,2841200,null,null,null];
const TARGET_12     = [1890000,2020000,2140000,2280000,2210000,2783086,2140000,2050000,2783086,2900000,2950000,3150000];

// Top 5 routes by revenue
const TOP_ROUTES = [
  { route:'DXB/DWC → KGL', rev:731398 },
  { route:'KGL → LHR',      rev:612540 },
  { route:'KGL → LOS',      rev:428190 },
  { route:'KGL → CDG',      rev:318760 },
  { route:'KGL → NBO',      rev:284100 },
];

// Top 5 stations
const TOP_STATIONS = [
  { code:'KGL', city:'Kigali',    rev:1240000, load:78.4, trend:[980,1050,1120,1180,1220,1240] },
  { code:'DXB', city:'Dubai',     rev:731398,  load:83.2, trend:[620,660,690,710,720,731] },
  { code:'NBO', city:'Nairobi',   rev:284100,  load:68.5, trend:[240,255,268,278,282,284] },
  { code:'LOS', city:'Lagos',     rev:428190,  load:76.8, trend:[380,395,410,418,424,428] },
  { code:'LHR', city:'London',    rev:612540,  load:74.3, trend:[580,590,599,604,610,613] },
];

function attainPct(actual, target) {
  return (actual / target * 100).toFixed(1);
}

function criticalNotifs() {
  return NOTIFICATIONS.filter(n => n.severity === 'critical').slice(0,5);
}

export function render() {
  const attain    = attainPct(EXEC_DATA.mtdRevenue, EXEC_DATA.mtdTarget);
  const ytdAttain = attainPct(EXEC_DATA.ytdRevenue, EXEC_DATA.fyTarget * (9/12));
  const crits     = criticalNotifs();

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">👔 Executive Dashboard</h1>
        <p class="page-sub">FY 2025-26 · RwandAir Cargo — Network Overview · ${formatDate(new Date(),'short')}</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-sec" onclick="window.print()">🖨 Print Report</button>
      </div>
    </div>

    <!-- Big 5 KPIs -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px">
      <div class="kpi-card" style="border-top:3px solid var(--navy)">
        <div class="kpi-label">Network Revenue MTD</div>
        <div class="kpi-value" style="font-size:22px">${formatNumber(EXEC_DATA.mtdRevenue,'currency')}</div>
        <div class="kpi-delta delta-up">${attain}% of target</div>
      </div>
      <div class="kpi-card" style="border-top:3px solid var(--green)">
        <div class="kpi-label">Network Load Factor</div>
        <div class="kpi-value" style="font-size:22px">${EXEC_DATA.netLoadFactor}%</div>
        <div class="kpi-delta delta-up">+3.1pp vs LY</div>
      </div>
      <div class="kpi-card" style="border-top:3px solid var(--teal)">
        <div class="kpi-label">Active Shipments</div>
        <div class="kpi-value" style="font-size:22px">${formatNumber(EXEC_DATA.activeShipments)}</div>
        <div class="kpi-delta">In transit &amp; warehouse</div>
      </div>
      <div class="kpi-card ${EXEC_DATA.dwellAlerts>5?'kpi-alert':''}" style="border-top:3px solid ${EXEC_DATA.dwellAlerts>5?'var(--red)':'var(--amber)'}">
        <div class="kpi-label">Dwell Alerts</div>
        <div class="kpi-value" style="font-size:22px;color:${EXEC_DATA.dwellAlerts>5?'var(--red)':'var(--amber)'}">${EXEC_DATA.dwellAlerts}</div>
        <div class="kpi-delta ${EXEC_DATA.dwellAlerts>5?'delta-down':''}">SLA breaches</div>
      </div>
      <div class="kpi-card ${EXEC_DATA.cassOutstanding>800000?'kpi-alert':''}" style="border-top:3px solid var(--purple)">
        <div class="kpi-label">CASS Outstanding</div>
        <div class="kpi-value" style="font-size:22px;color:${EXEC_DATA.cassOutstanding>800000?'var(--red)':'var(--dark)'}">${formatNumber(EXEC_DATA.cassOutstanding,'currency')}</div>
        <div class="kpi-delta ${EXEC_DATA.cassOutstanding>800000?'delta-down':''}">GSA receivables</div>
      </div>
    </div>

    <!-- Revenue Chart + Top Routes -->
    <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Revenue vs Target — FY 2025-26</span>
          <span style="font-size:12px;color:var(--mid)">YTD: ${formatNumber(EXEC_DATA.ytdRevenue,'currency')} (${ytdAttain}% of pro-rata)</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="exec-rev-chart"></canvas>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Top 5 Routes by Revenue</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="exec-routes-chart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Stations + Alerts -->
    <div style="display:grid;grid-template-columns:3fr 2fr;gap:16px">
      <div class="card">
        <div class="card-header"><span class="card-title">Top Performing Stations</span></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:12px">
            ${TOP_STATIONS.map((s,i) => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px;background:var(--smoke);border-radius:var(--radius-sm)">
                <span style="font-size:20px;font-weight:800;color:var(--border);width:28px;text-align:right">${i+1}</span>
                <div style="width:36px;height:36px;background:var(--navy);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:11px">${s.code}</div>
                <div style="flex:1">
                  <div style="font-weight:600">${esc(s.city)}</div>
                  <div style="font-size:11px;color:var(--mid)">Load: ${s.load}%</div>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700">${formatNumber(s.rev,'currency')}</div>
                  <canvas id="exec-spark-${s.code}" width="60" height="22"></canvas>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">Critical Alerts</span>
          <a href="#dwell-alerts" style="font-size:12px;color:var(--teal)">View all</a>
        </div>
        <div class="card-body">
          ${crits.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--mid)">✅ No critical alerts</div>` :
          crits.map(n => `
            <div style="padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="window.location.hash='${n.link.slice(1)}'">
              <div style="display:flex;align-items:flex-start;gap:8px">
                <span style="font-size:16px;flex-shrink:0">${n.type==='DWELL'?'⏱️':n.type==='ALERT'?'⚠️':'📋'}</span>
                <div>
                  <div style="font-weight:600;font-size:12px">${esc(n.title)}</div>
                  <div style="font-size:11px;color:var(--mid);margin-top:2px">${esc(n.message.slice(0,80))}…</div>
                  <div style="font-size:10px;color:var(--mid);margin-top:4px">
                    <span class="badge badge-red" style="font-size:10px">Critical</span>
                    <span style="margin-left:6px">${n.station}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- FY Progress Bar -->
    <div class="card" style="margin-top:16px">
      <div class="card-body" style="padding:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="font-weight:600">FY 2025-26 Progress — ${formatNumber(EXEC_DATA.ytdRevenue,'currency')} of ${formatNumber(FY_TOTAL_TARGET,'currency')}</span>
          <span style="font-weight:700;color:var(--green)">${attainPct(EXEC_DATA.ytdRevenue, FY_TOTAL_TARGET)}%</span>
        </div>
        <div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden">
          <div style="height:12px;width:${attainPct(EXEC_DATA.ytdRevenue, FY_TOTAL_TARGET)}%;background:linear-gradient(90deg,var(--navy),var(--teal));border-radius:6px;transition:width .8s ease"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--mid)">
          <span>Jul 2025</span>
          <span>9 months complete · 3 months remaining</span>
          <span>Jun 2026</span>
        </div>
      </div>
    </div>
  </div>`;
}

export function init(container) {
  // Revenue vs target line
  buildLineChart('exec-rev-chart', MONTHS_12, [
    {
      label: 'Actual Revenue',
      data: ACTUAL_12,
      borderColor: '#00529B',
      backgroundColor: '#00529B22',
      fill: true,
      tension: 0.3,
      spanGaps: false,
    },
    {
      label: 'Target',
      data: TARGET_12,
      borderColor: '#FEE014',
      borderDash: [6,3],
      pointRadius: 2,
      fill: false,
    },
  ]);

  // Top routes horizontal bar
  buildBarChart('exec-routes-chart',
    TOP_ROUTES.map(r => r.route),
    [{ label:'Revenue MTD ($)', data: TOP_ROUTES.map(r => r.rev), backgroundColor:'#1EA2DC' }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  // Station sparklines
  TOP_STATIONS.forEach(s => {
    const canvas = container.querySelector(`#exec-spark-${s.code}`);
    if (!canvas || !window.Chart) return;
    try {
      new window.Chart(canvas, {
        type:'line',
        data:{ labels: s.trend.map((_,i)=>i), datasets:[{ data:s.trend, borderColor:'#00529B', borderWidth:1.5, pointRadius:0, fill:false, tension:0.4 }] },
        options:{ animation:false, plugins:{ legend:{display:false}, tooltip:{enabled:false} }, scales:{ x:{display:false}, y:{display:false} }, responsive:true, maintainAspectRatio:false },
      });
    } catch(e) { /* chart may already exist */ }
  });
}

export const handler = { render, init };
