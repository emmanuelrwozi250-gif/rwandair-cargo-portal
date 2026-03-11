// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Commercial View
// Revenue performance · Route analysis · Regional breakdown
// ═══════════════════════════════════════════════════════════════════

import { REVENUE_TARGETS, MONTHS, FY_TOTAL_TARGET, getTopMarkets, getNetworkMonthlyTotals } from '../data/revenue.js';
import { ROUTES } from '../data/flights.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart, buildLineChart, buildDoughnut } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

const MTD_REVENUE = 2_841_200;
const MTD_TARGET  = 2_783_086;
const YTD_REVENUE = 18_620_400;
const YTD_TARGET  = 18_310_000;
const MTD_ATTAIN  = (MTD_REVENUE / MTD_TARGET * 100).toFixed(1);

const ROUTE_PERF = [
  { route:'KGL–DXB', region:'Middle East',    revMTD:731_398, target:718_000, load:81.2, yield:3.42 },
  { route:'KGL–LHR', region:'Europe',         revMTD:612_540, target:598_000, load:79.4, yield:4.21 },
  { route:'KGL–LOS', region:'West Africa',    revMTD:428_190, target:410_000, load:76.8, yield:2.87 },
  { route:'KGL–CDG', region:'Europe',         revMTD:318_760, target:330_000, load:72.1, yield:3.96 },
  { route:'KGL–NBO', region:'East Africa',    revMTD:284_100, target:279_000, load:68.5, yield:2.14 },
  { route:'KGL–JNB', region:'Southern',       revMTD:241_850, target:248_000, load:74.3, yield:2.63 },
  { route:'KGL–EBB', region:'East Africa',    revMTD:198_420, target:202_000, load:83.1, yield:1.89 },
  { route:'KGL–ADD', region:'East Africa',    revMTD:176_300, target:180_000, load:71.2, yield:2.31 },
];

const MONTHLY_ACTUALS      = [1920000,2050000,2180000,2340000,2290000,2750000,2180000,2070000,2841200];
const MONTHLY_TARGETS_NET  = [1890000,2020000,2140000,2280000,2210000,2783086,2140000,2050000,2783086];
const MONTHS_YTD           = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26'];

const REGION_LABELS   = ['Middle East','Europe','East Africa','West Africa','Southern Africa','Central Africa'];
const REGION_REVENUES = [8780000,6120000,3350000,2870000,1890000,1040000];
const REGION_COLORS   = ['#00529B','#FEE014','#1EA2DC','#94C943','#C0392B','#7C3AED'];

function lfClass(v)  { return v >= 85 ? 'lf-over' : v >= 75 ? 'lf-high' : v >= 60 ? 'lf-mid' : 'lf-low'; }
function attBadge(pct) {
  const p = parseFloat(pct);
  if (p >= 100) return `<span class="badge badge-green">${pct}%</span>`;
  if (p >= 90)  return `<span class="badge badge-amber">${pct}%</span>`;
  return `<span class="badge badge-red">${pct}%</span>`;
}

export function render() {
  const fyRemaining = FY_TOTAL_TARGET - YTD_REVENUE;
  const ytdAttain   = (YTD_REVENUE / YTD_TARGET * 100).toFixed(1);

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('bar-chart-2', 18)}</span>
        <div>
          <div class="portal-header-title">Commercial View</div>
          <div class="portal-header-sub">FY 2025-26 · Revenue performance &amp; market analysis · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <select class="form-select form-select-sm" id="comm-month-sel" onchange="commFilterMonth(this.value)">
          ${MONTHS_YTD.map((m,i) => `<option value="${i}" ${i===8?'selected':''}>${m}</option>`).join('')}
        </select>
        <button class="btn btn-ghost btn-sm" onclick="window.print()">
          ${icon('printer', 13)} Print
        </button>
        <button class="btn btn-sec btn-sm" onclick="commExport()">
          ${icon('download', 13)} Export
        </button>
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('dollar-sign', 11)} MTD Revenue</div>
        <div class="kpi-value kpi-sm">${formatNumber(MTD_REVENUE,'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('trending-up',12)} ${MTD_ATTAIN}% attainment</span>
          <span class="kpi-attain ${parseFloat(MTD_ATTAIN)>=100?'over':'under'}">${MTD_ATTAIN}%</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${Math.min(parseFloat(MTD_ATTAIN),100)}%"></div></div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('trending-up', 11)} YTD Revenue</div>
        <div class="kpi-value kpi-sm">${formatNumber(YTD_REVENUE,'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check',12)} ${ytdAttain}% of YTD target</span>
          <span class="kpi-attain ${parseFloat(ytdAttain)>=100?'over':'under'}">${ytdAttain}%</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${Math.min(parseFloat(ytdAttain),100)}%"></div></div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('target', 11)} FY Remaining</div>
        <div class="kpi-value kpi-sm">${formatNumber(fyRemaining,'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('calendar',12)} 3 months to go</span>
        </div>
      </div>

      <div class="kpi-card kpi-gold">
        <div class="kpi-label">${icon('zap', 11)} MTD vs Target</div>
        <div class="kpi-value kpi-sm" style="color:var(--green)">+${formatNumber(MTD_REVENUE-MTD_TARGET,'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('trending-up',12)} Above plan</span>
        </div>
      </div>

    </div>

    <!-- ── Charts row ──────────────────────────────────────────────── -->
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;margin-bottom:16px">

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('bar-chart', 14)} Monthly Revenue vs Target (YTD)</span>
          <span style="font-size:11px;color:var(--mid)">Jul 2025 — Mar 2026</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:230px">
            <canvas id="comm-monthly-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <span class="card-title">${icon('pie-chart', 14)} Revenue by Region</span>
        </div>
        <div class="card-body">
          <div class="chart-wrap" style="height:230px">
            <canvas id="comm-region-chart"></canvas>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Route Performance Table ─────────────────────────────────── -->
    <div class="table-wrap" style="margin-bottom:16px">
      <div class="table-header">
        <div>
          <div class="table-title">${icon('map', 14)} Route Performance — MTD</div>
          <div class="table-count">${ROUTE_PERF.length} routes</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <select class="form-select form-select-sm" onchange="commFilterRegion(this.value)">
            <option value="">All Regions</option>
            ${REGION_LABELS.map(r=>`<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Region</th>
              <th class="th-num">Revenue MTD</th>
              <th class="th-num">Target MTD</th>
              <th class="th-num">Attainment</th>
              <th class="th-num">vs Target</th>
              <th>Load Factor</th>
              <th class="th-num">Yield $/kg</th>
            </tr>
          </thead>
          <tbody>
            ${ROUTE_PERF.map(r => {
              const att  = (r.revMTD / r.target * 100).toFixed(1);
              const diff = r.revMTD - r.target;
              return `
              <tr>
                <td><strong class="td-mono">${esc(r.route)}</strong></td>
                <td><span class="badge badge-blue badge-sm">${esc(r.region)}</span></td>
                <td class="td-num td-strong">${formatNumber(r.revMTD,'currency')}</td>
                <td class="td-num td-muted">${formatNumber(r.target,'currency')}</td>
                <td class="td-num">${attBadge(att)}</td>
                <td class="td-num" style="color:${diff>=0?'var(--green)':'var(--red)'}">
                  ${diff>=0?'+':''}${formatNumber(diff,'currency')}
                </td>
                <td>
                  <div class="lf-bar" style="min-width:120px">
                    <div class="lf-track">
                      <div class="lf-fill ${lfClass(r.load)}" style="width:${r.load}%"></div>
                    </div>
                    <span class="lf-val">${r.load}%</span>
                  </div>
                </td>
                <td class="td-num td-strong">$${r.yield.toFixed(2)}/kg</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── Top Markets ─────────────────────────────────────────────── -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">${icon('globe', 14)} Top Markets — FY Target Contribution</span>
        <a href="#network" class="card-link">${icon('arrow-right',12)} Network map</a>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="height:240px">
          <canvas id="comm-markets-chart"></canvas>
        </div>
      </div>
    </div>

  </div>`;
}

export function init(container) {
  buildBarChart('comm-monthly-chart', MONTHS_YTD, [
    { label:'Actual Revenue', data: MONTHLY_ACTUALS,     backgroundColor:'#00529B', borderRadius:4 },
    { label:'Target',         data: MONTHLY_TARGETS_NET, backgroundColor:'rgba(254,224,20,0.7)', borderRadius:4 },
  ]);

  buildDoughnut('comm-region-chart', REGION_LABELS, REGION_REVENUES, REGION_COLORS);

  const topMkts = getTopMarkets(8);
  buildBarChart('comm-markets-chart',
    topMkts.map(m => m.market),
    [{ label:'FY Revenue Target ($)', data: topMkts.map(m => m.fyTotal), backgroundColor:'#1EA2DC', borderRadius:4 }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  window.commFilterMonth  = (v) => showToast('Period filter', 'info', `Showing: ${MONTHS_YTD[v]}`, 1500);
  window.commFilterRegion = (v) => showToast('Region filter', 'info', v ? `Region: ${v}` : 'All regions', 1500);
  window.commExport       = () => { showToast('Generating export…', 'info'); setTimeout(() => showToast('Commercial report downloaded', 'success'), 1600); };
}

export const handler = { render, init };
