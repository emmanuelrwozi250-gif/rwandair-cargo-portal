// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Commercial View
// ═══════════════════════════════════════════════════════════════════

import { REVENUE_TARGETS, MONTHS, FY_TOTAL_TARGET, getTopMarkets, getNetworkMonthlyTotals } from '../data/revenue.js';
import { ROUTES } from '../data/flights.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart, buildLineChart, buildDoughnut } from '../utils/charts.js';
import { showToast } from '../components/toast.js';

// MTD figures (Dec-25 actuals based on Dec 2025 monthly report)
const MTD_REVENUE   = 2_841_200;
const MTD_TARGET    = 2_783_086;
const YTD_REVENUE   = 18_620_400;
const YTD_TARGET    = 18_310_000;
const MTD_ATTAIN    = (MTD_REVENUE / MTD_TARGET * 100).toFixed(1);

// Route performance table
const ROUTE_PERF = [
  { route:'KGL–DXB', region:'Middle East', revMTD:731398, target:718000, load:81.2, yield:3.42 },
  { route:'KGL–LHR', region:'Europe',      revMTD:612540, target:598000, load:79.4, yield:4.21 },
  { route:'KGL–LOS', region:'West Africa', revMTD:428190, target:410000, load:76.8, yield:2.87 },
  { route:'KGL–CDG', region:'Europe',      revMTD:318760, target:330000, load:72.1, yield:3.96 },
  { route:'KGL–NBO', region:'East Africa', revMTD:284100, target:279000, load:68.5, yield:2.14 },
  { route:'KGL–JNB', region:'Southern',    revMTD:241850, target:248000, load:74.3, yield:2.63 },
  { route:'KGL–EBB', region:'East Africa', revMTD:198420, target:202000, load:83.1, yield:1.89 },
  { route:'KGL–ADD', region:'East Africa', revMTD:176300, target:180000, load:71.2, yield:2.31 },
];

// Monthly revenue (YTD Jul–Mar)
const MONTHLY_ACTUALS = [1920000,2050000,2180000,2340000,2290000,2750000,2180000,2070000,2841200];
const MONTHLY_TARGETS_NET = [1890000,2020000,2140000,2280000,2210000,2783086,2140000,2050000,2783086];
const MONTHS_YTD = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26'];

// Region breakdown
const REGION_LABELS   = ['Middle East','Europe','East Africa','West Africa','Southern Africa','Central Africa'];
const REGION_REVENUES = [8780000, 6120000, 3350000, 2870000, 1890000, 1040000];
const REGION_COLORS   = ['#00529B','#FEE014','#1EA2DC','#94C943','#C0392B','#7C3AED'];

function attainClass(pct) {
  return pct >= 100 ? 'badge-green' : pct >= 90 ? 'badge-amber' : 'badge-red';
}

export function render() {
  const topMkts = getTopMarkets(5);

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">📊 Commercial View</h1>
        <p class="page-sub">FY 2025-26 — Revenue performance &amp; market analysis</p>
      </div>
      <div class="page-actions">
        <select class="form-select" id="comm-month-sel" style="width:140px" onchange="commFilterMonth(this.value)">
          ${MONTHS_YTD.map((m,i) => `<option value="${i}" ${i===8?'selected':''}>${m}</option>`).join('')}
        </select>
        <button class="btn btn-sec" onclick="window.print()">⬇ Export</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">MTD Revenue</div>
        <div class="kpi-value">${formatNumber(MTD_REVENUE,'currency')}</div>
        <div class="kpi-delta delta-up">Target: ${formatNumber(MTD_TARGET,'currency')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">MTD Attainment</div>
        <div class="kpi-value" style="color:var(--green)">${MTD_ATTAIN}%</div>
        <div class="kpi-delta delta-up">+${formatNumber(MTD_REVENUE - MTD_TARGET,'currency')} vs target</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">YTD Revenue</div>
        <div class="kpi-value">${formatNumber(YTD_REVENUE,'currency')}</div>
        <div class="kpi-delta delta-up">Target: ${formatNumber(YTD_TARGET,'currency')}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">FY Target Remaining</div>
        <div class="kpi-value">${formatNumber(FY_TOTAL_TARGET - YTD_REVENUE,'currency')}</div>
        <div class="kpi-delta">FY Total: ${formatNumber(FY_TOTAL_TARGET,'currency')}</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Monthly Revenue vs Target (YTD)</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="comm-monthly-chart"></canvas>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Revenue by Region</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="comm-region-chart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Performance Table -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <span class="card-title">Route Performance — MTD</span>
        <select class="form-select" style="width:160px" onchange="commFilterRegion(this.value)">
          <option value="">All Regions</option>
          ${REGION_LABELS.map(r=>`<option value="${r}">${r}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Region</th>
              <th>Revenue MTD</th>
              <th>Target MTD</th>
              <th>Attainment</th>
              <th>vs Target</th>
              <th>Load Factor</th>
              <th>Yield $/kg</th>
            </tr>
          </thead>
          <tbody>
            ${ROUTE_PERF.map(r => {
              const att = (r.revMTD / r.target * 100).toFixed(1);
              const diff = r.revMTD - r.target;
              return `
              <tr>
                <td><strong>${esc(r.route)}</strong></td>
                <td><span class="badge badge-blue">${esc(r.region)}</span></td>
                <td><strong>${formatNumber(r.revMTD,'currency')}</strong></td>
                <td style="color:var(--mid)">${formatNumber(r.target,'currency')}</td>
                <td><span class="badge ${attainClass(parseFloat(att))}">${att}%</span></td>
                <td style="color:${diff>=0?'var(--green)':'var(--red)'}">
                  ${diff>=0?'+':''}${formatNumber(diff,'currency')}
                </td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="flex:1;height:4px;background:var(--border);border-radius:2px">
                      <div style="width:${r.load}%;height:4px;background:${r.load>80?'var(--green)':r.load>65?'var(--amber)':'var(--red)'};border-radius:2px"></div>
                    </div>
                    <span style="font-size:12px;font-weight:600">${r.load}%</span>
                  </div>
                </td>
                <td style="font-weight:600">${formatNumber(r.yield,'yield')}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Top Markets -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Top Markets — FY Target Contribution</span>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="height:220px">
          <canvas id="comm-markets-chart"></canvas>
        </div>
      </div>
    </div>
  </div>`;
}

export function init(container) {
  // Monthly trend chart
  buildBarChart('comm-monthly-chart', MONTHS_YTD, [
    { label:'Actual Revenue', data: MONTHLY_ACTUALS, backgroundColor:'#00529B' },
    { label:'Target',         data: MONTHLY_TARGETS_NET, backgroundColor:'#FEE014', borderRadius:2 },
  ]);

  // Region doughnut
  buildDoughnut('comm-region-chart', REGION_LABELS, REGION_REVENUES, REGION_COLORS);

  // Top markets bar
  const topMkts = getTopMarkets(8);
  buildBarChart('comm-markets-chart',
    topMkts.map(m => m.market),
    [{ label:'FY Revenue Target ($)', data: topMkts.map(m => m.fyTotal), backgroundColor:'#1EA2DC' }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  window.commFilterMonth  = (v) => showToast('Period selected', 'info', `Showing: ${MONTHS_YTD[v]}`, 1500);
  window.commFilterRegion = (v) => showToast('Filter applied', 'info', `Region: ${v||'All'}`, 1500);
}

export const handler = { render, init };
