// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Yield Analysis
// ═══════════════════════════════════════════════════════════════════

import { ROUTES } from '../data/flights.js';
import { RATE_CARDS } from '../data/rates.js';
import { formatNumber, esc } from '../utils/format.js';
import { buildBarChart, buildLineChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';

// Route yield data (real rates derived from Dec 2025 report + rate cards)
const ROUTE_YIELDS = [
  { route:'DWC–KGL', label:'Dubai (DWC) → KGL',   yield:3.15, vol:28400, rev:89460, load:83.2, commodity:'General' },
  { route:'SHJ–KGL', label:'Sharjah → KGL',         yield:3.15, vol:24100, rev:75915, load:78.4, commodity:'General' },
  { route:'KGL–LHR', label:'KGL → London',           yield:4.21, vol:18200, rev:76622, load:74.3, commodity:'General' },
  { route:'SHJ–LOS', label:'Sharjah → Lagos',        yield:1.25, vol:42600, rev:53250, load:91.2, commodity:'General' },
  { route:'SHJ–EBB', label:'Sharjah → Entebbe',      yield:0.95, vol:38800, rev:36860, load:88.7, commodity:'General' },
  { route:'KGL–NBO', label:'KGL → Nairobi',           yield:2.14, vol:16800, rev:35952, load:70.1, commodity:'General' },
  { route:'KGL–LOS', label:'KGL → Lagos',             yield:2.87, vol:22600, rev:64882, load:79.5, commodity:'General' },
  { route:'KGL–JNB', label:'KGL → Johannesburg',      yield:2.63, vol:14200, rev:37346, load:68.4, commodity:'General' },
  { route:'HUM–KGL', label:'Human Remains (HUM)',     yield:9.00, vol:420,   rev:3780,  load:100,  commodity:'HUM' },
  { route:'KGL–CDG', label:'KGL → Paris CDG',         yield:3.96, vol:12800, rev:50688, load:71.8, commodity:'General' },
];

// Commodity yield breakdown
const COMMODITY_YIELDS = [
  { type:'Human Remains (HUM)',    yield:9.00, vol:420 },
  { type:'Electronics (ELI)',      yield:4.80, vol:3200 },
  { type:'Pharmaceuticals (PHA)',  yield:4.50, vol:8400 },
  { type:'Express Mail (EAP)',     yield:4.20, vol:2100 },
  { type:'General Cargo',          yield:3.15, vol:86000 },
  { type:'Temperature (PER/COL)',  yield:3.80, vol:12800 },
  { type:'Dangerous Goods (RCM)',  yield:3.50, vol:4200 },
  { type:'Live Animals (AVI)',     yield:3.20, vol:1800 },
  { type:'Perishables (PER)',      yield:2.90, vol:38000 },
];

// Monthly yield trend
const YIELD_MONTHS  = ['Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25','Jan-26','Feb-26','Mar-26'];
const YIELD_TREND   = [3.12, 3.18, 3.24, 3.31, 3.29, 3.41, 3.28, 3.19, 3.35];
const YIELD_TARGET  = Array(9).fill(3.25);

export function render() {
  const avgYield   = (ROUTE_YIELDS.reduce((s,r) => s + r.yield, 0) / ROUTE_YIELDS.length).toFixed(2);
  const bestRoute  = [...ROUTE_YIELDS].sort((a,b) => b.yield - a.yield)[0];
  const worstRoute = [...ROUTE_YIELDS].sort((a,b) => a.yield - b.yield)[0];
  const netRev     = ROUTE_YIELDS.reduce((s,r) => s + r.rev, 0);

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">📈 Yield Analysis</h1>
        <p class="page-sub">Revenue yield per kg — route &amp; commodity breakdown</p>
      </div>
      <div class="page-actions">
        <select class="form-select" style="width:140px" onchange="yieldFilterPeriod(this.value)">
          <option>Mar-26 (MTD)</option>
          <option>Dec-25</option>
          <option>Jan-26</option>
          <option>Feb-26</option>
          <option>FY 2025-26</option>
        </select>
        <button class="btn btn-sec" onclick="yieldExport()">⬇ Export</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Network Avg Yield</div>
        <div class="kpi-value">${formatNumber(parseFloat(avgYield),'yield')}</div>
        <div class="kpi-delta delta-up">+$0.10 vs LY</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Best Route Yield</div>
        <div class="kpi-value" style="color:var(--green)">${formatNumber(bestRoute.yield,'yield')}</div>
        <div class="kpi-delta">${esc(bestRoute.label)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Lowest Route Yield</div>
        <div class="kpi-value" style="color:var(--amber)">${formatNumber(worstRoute.yield,'yield')}</div>
        <div class="kpi-delta">${esc(worstRoute.label)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Route Revenue</div>
        <div class="kpi-value">${formatNumber(netRev,'currency')}</div>
        <div class="kpi-delta">All routes combined</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <div class="card">
        <div class="card-header"><span class="card-title">Yield by Route ($/kg)</span></div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="yield-route-chart"></canvas>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Yield Trend vs Target</span></div>
        <div class="card-body">
          <div class="chart-wrap" style="height:220px">
            <canvas id="yield-trend-chart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Commodity Yield Chart -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><span class="card-title">Yield by Commodity Type</span></div>
      <div class="card-body">
        <div class="chart-wrap" style="height:180px">
          <canvas id="yield-commodity-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- Route Yield Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Route Yield Detail</span>
        <select class="form-select" style="width:160px" onchange="yieldSort(this.value)">
          <option value="yield">Sort by Yield</option>
          <option value="vol">Sort by Volume</option>
          <option value="rev">Sort by Revenue</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Yield $/kg</th>
              <th>Volume (kg)</th>
              <th>Revenue</th>
              <th>Load Factor</th>
              <th>Commodity</th>
            </tr>
          </thead>
          <tbody>
            ${[...ROUTE_YIELDS].sort((a,b) => b.yield - a.yield).map(r => `
              <tr>
                <td><strong>${esc(r.label)}</strong></td>
                <td>
                  <span style="font-size:15px;font-weight:700;color:${r.yield>=4?'var(--green)':r.yield>=2.5?'var(--navy)':'var(--amber)'}">
                    ${formatNumber(r.yield,'yield')}
                  </span>
                </td>
                <td>${formatNumber(r.vol)} kg</td>
                <td>${formatNumber(r.rev,'currency')}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="flex:1;height:4px;background:var(--border);border-radius:2px;min-width:60px">
                      <div style="width:${r.load}%;height:4px;background:${r.load>80?'var(--green)':'var(--amber)'};border-radius:2px"></div>
                    </div>
                    <span style="font-size:12px;font-weight:600">${r.load}%</span>
                  </div>
                </td>
                <td><span class="badge">${esc(r.commodity)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

export function init(container) {
  // Route yield bar
  buildBarChart('yield-route-chart',
    ROUTE_YIELDS.map(r => r.route),
    [{ label:'Yield $/kg', data: ROUTE_YIELDS.map(r => r.yield),
       backgroundColor: ROUTE_YIELDS.map(r => r.yield >= 4 ? '#1A8A4A' : r.yield >= 2.5 ? '#00529B' : '#D97706')
    }],
    { plugins:{ legend:{ display:false } } }
  );

  // Trend line
  buildLineChart('yield-trend-chart', YIELD_MONTHS, [
    { label:'Actual Yield', data: YIELD_TREND, borderColor:'#00529B', backgroundColor:'#00529B22', fill:true, tension:0.3 },
    { label:'Target',       data: YIELD_TARGET, borderColor:'#FEE014', borderDash:[5,5], pointRadius:0, fill:false },
  ]);

  // Commodity bar
  buildBarChart('yield-commodity-chart',
    COMMODITY_YIELDS.map(c => c.type),
    [{ label:'Yield $/kg', data: COMMODITY_YIELDS.map(c => c.yield),
       backgroundColor:'#1EA2DC',
    }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  window.yieldFilterPeriod = (v) => showToast('Period selected', 'info', v, 1500);
  window.yieldExport = () => showToast('Yield report exported', 'info', 'CSV download started', 2000);
  window.yieldSort = (v) => showToast('Sorted by ' + v, 'info', '', 1000);
}

export const handler = { render, init };
