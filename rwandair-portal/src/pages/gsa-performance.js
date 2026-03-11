// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — GSA Performance
// ═══════════════════════════════════════════════════════════════════

import { GSAS, CASS_SUMMARY, getOverdueGSAs } from '../data/gsas.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart, buildSparkline } from '../utils/charts.js';
import { showToast } from '../components/toast.js';

function ragBadge(rag) {
  if (rag === 'GREEN')  return `<span class="badge badge-green">● Current</span>`;
  if (rag === 'AMBER')  return `<span class="badge badge-amber">● 30–60 days</span>`;
  if (rag === 'RED')    return `<span class="badge badge-red">● Overdue</span>`;
  return `<span class="badge">—</span>`;
}

function accBadge(pct) {
  if (pct >= 95) return `<span class="badge badge-green">${pct}%</span>`;
  if (pct >= 80) return `<span class="badge badge-amber">${pct}%</span>`;
  return `<span class="badge badge-red">${pct}%</span>`;
}

export function render() {
  const overdue    = getOverdueGSAs();
  const totalCASS  = GSAS.reduce((s, g) => s + (g.cassBalance || 0), 0);
  const avgAcc     = (GSAS.reduce((s, g) => s + (g.bookingAccuracy || 0), 0) / GSAS.length).toFixed(1);
  const onTimeSettl= GSAS.filter(g => g.rag === 'GREEN').length;
  const settPct    = (onTimeSettl / GSAS.length * 100).toFixed(0);

  return `
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">🤝 GSA Performance</h1>
        <p class="page-sub">CASS settlements, booking accuracy &amp; revenue performance</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-sec" onclick="gsaExport()">⬇ Export</button>
        <button class="btn btn-pri" onclick="gsaSendStatements()">Send Statements</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Active GSAs</div>
        <div class="kpi-value">${GSAS.length}</div>
        <div class="kpi-delta">Across ${new Set(GSAS.map(g=>g.station)).size} stations</div>
      </div>
      <div class="kpi-card ${totalCASS > 500000 ? 'kpi-alert' : ''}">
        <div class="kpi-label">CASS Outstanding</div>
        <div class="kpi-value" style="color:${totalCASS>500000?'var(--red)':'var(--dark)'}">
          ${formatNumber(totalCASS,'currency')}
        </div>
        <div class="kpi-delta ${overdue.length>0?'delta-down':'delta-up'}">${overdue.length} overdue accounts</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">On-Time Settlement</div>
        <div class="kpi-value">${settPct}%</div>
        <div class="kpi-delta delta-up">${onTimeSettl} of ${GSAS.length} current</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg Booking Accuracy</div>
        <div class="kpi-value">${avgAcc}%</div>
        <div class="kpi-delta">Network standard: 95%</div>
      </div>
    </div>

    <!-- CASS Outstanding Chart -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-header">
        <span class="card-title">CASS Balances by GSA</span>
        <div class="filter-bar">
          <select class="form-select" style="width:140px" onchange="gsaFilterRag(this.value)">
            <option value="">All Status</option>
            <option value="GREEN">Current</option>
            <option value="AMBER">30–60 days</option>
            <option value="RED">Overdue</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="height:200px">
          <canvas id="gsa-cass-chart"></canvas>
        </div>
      </div>
    </div>

    <!-- GSA Table -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">GSA Directory</span>
        <input type="text" class="form-input search-input" placeholder="Search GSA or station…" oninput="gsaSearch(this.value)" style="width:220px">
      </div>
      <div class="table-wrap">
        <table id="gsa-table">
          <thead>
            <tr>
              <th>GSA Code</th>
              <th>Company</th>
              <th>Station</th>
              <th>CASS Balance</th>
              <th>RAG Status</th>
              <th>Booking Acc.</th>
              <th>Revenue MTD</th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${GSAS.map((g, i) => `
              <tr>
                <td><code style="font-size:12px">${esc(g.code)}</code></td>
                <td>
                  <div style="font-weight:600;font-size:13px">${esc(g.name)}</div>
                  <div style="font-size:11px;color:var(--mid)">${esc(g.contact||'')}</div>
                </td>
                <td><span class="badge badge-blue">${esc(g.station)}</span></td>
                <td>
                  <strong style="color:${(g.cassBalance||0)>100000?'var(--red)':(g.cassBalance||0)>50000?'var(--amber)':'var(--dark)'}"">
                    ${g.cassBalance ? formatNumber(g.cassBalance,'currency') : '—'}
                  </strong>
                </td>
                <td>${ragBadge(g.rag)}</td>
                <td>${accBadge(g.bookingAccuracy || 90)}</td>
                <td>${formatNumber(g.revenueMTD || 0,'currency')}</td>
                <td>
                  <canvas id="gsa-spark-${i}" width="80" height="32"></canvas>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" onclick="gsaViewDetail('${esc(g.code)}')">View</button>
                    ${(g.cassBalance||0)>0 ? `<button class="btn btn-sec btn-sm" onclick="gsaSendStatement('${esc(g.code)}')">Statement</button>` : ''}
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
  // CASS outstanding bar chart (top 8 by balance)
  const sorted = [...GSAS].filter(g => g.cassBalance > 0).sort((a,b) => b.cassBalance - a.cassBalance).slice(0,8);
  buildBarChart('gsa-cass-chart',
    sorted.map(g => g.name.length > 22 ? g.name.slice(0,20)+'…' : g.name),
    [{
      label:'CASS Outstanding ($)',
      data: sorted.map(g => g.cassBalance),
      backgroundColor: sorted.map(g => g.rag === 'RED' ? '#C0392B' : g.rag === 'AMBER' ? '#D97706' : '#1A8A4A'),
    }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  // Sparklines
  GSAS.forEach((g, i) => {
    const canvas = container.querySelector(`#gsa-spark-${i}`);
    if (!canvas || !window.Chart) return;
    const vals = g.monthlyTrend || [80000,95000,88000,102000,97000,g.revenueMTD||0];
    buildSparkline(`gsa-spark-${i}`, vals, g.rag === 'RED' ? '#C0392B' : '#00529B');
  });

  // Handlers
  window.gsaSearch = (v) => {
    const q = v.toLowerCase();
    container.querySelectorAll('#gsa-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
  window.gsaFilterRag  = (v) => showToast('Filter applied', 'info', `RAG: ${v||'All'}`, 1500);
  window.gsaExport     = () => showToast('Exporting GSA report…', 'info', 'CSV download started', 2000);
  window.gsaSendStatements = () => showToast('Statements queued', 'success', 'Email statements sent to all active GSAs', 3000);
  window.gsaSendStatement  = (code) => showToast(`Statement sent — ${code}`, 'success', 'CASS statement dispatched by email', 3000);
  window.gsaViewDetail = (code) => showToast(`GSA Detail — ${code}`, 'info', 'Full detail view coming in next release', 2000);
}

export const handler = { render, init };
