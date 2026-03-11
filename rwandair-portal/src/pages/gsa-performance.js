// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — GSA Performance
// CASS settlements · booking accuracy · revenue per GSA
// ═══════════════════════════════════════════════════════════════════

import { GSAS, CASS_SUMMARY, getOverdueGSAs } from '../data/gsas.js';
import { formatNumber, formatDate, esc } from '../utils/format.js';
import { buildBarChart, buildSparkline } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

function ragBadge(rag) {
  if (rag === 'GREEN') return `<span class="badge badge-green badge-sm">${icon('check-circle',10)} Current</span>`;
  if (rag === 'AMBER') return `<span class="badge badge-amber badge-sm">${icon('clock',10)} 30–60 days</span>`;
  if (rag === 'RED')   return `<span class="badge badge-red badge-sm">${icon('alert-circle',10)} Overdue</span>`;
  return `<span class="badge badge-sm">—</span>`;
}

function accBadge(pct) {
  if (pct >= 95) return `<span class="badge badge-green badge-sm">${pct}%</span>`;
  if (pct >= 80) return `<span class="badge badge-amber badge-sm">${pct}%</span>`;
  return `<span class="badge badge-red badge-sm">${pct}%</span>`;
}

export function render() {
  const overdue      = getOverdueGSAs();
  const totalCASS    = GSAS.reduce((s, g) => s + (g.cassBalance || 0), 0);
  const avgAcc       = (GSAS.reduce((s, g) => s + (g.bookingAccuracy || 0), 0) / GSAS.length).toFixed(1);
  const onTimeSettl  = GSAS.filter(g => g.rag === 'GREEN').length;
  const settPct      = (onTimeSettl / GSAS.length * 100).toFixed(0);
  const cassHigh     = totalCASS > 500_000;

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('users', 18)}</span>
        <div>
          <div class="portal-header-title">GSA Performance</div>
          <div class="portal-header-sub">CASS settlements · booking accuracy · network coverage · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" onclick="gsaExport()">
          ${icon('download', 13)} Export
        </button>
        <button class="btn btn-pri btn-sm" onclick="gsaSendStatements()">
          ${icon('send', 13)} Send Statements
        </button>
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('users', 11)} Active GSAs</div>
        <div class="kpi-value kpi-sm">${GSAS.length}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('map-pin',12)} ${new Set(GSAS.map(g=>g.station)).size} stations covered</span>
        </div>
      </div>

      <div class="kpi-card ${cassHigh ? 'kpi-red' : 'kpi-amber'}">
        <div class="kpi-label">${icon('credit-card', 11)} CASS Outstanding</div>
        <div class="kpi-value kpi-sm">${formatNumber(totalCASS,'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta ${overdue.length>0?'down':''}">${icon('alert-triangle',12)} ${overdue.length} overdue accounts</span>
          ${cassHigh ? `<span class="kpi-attain under">Review</span>` : ''}
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('check-circle', 11)} On-Time Settlement</div>
        <div class="kpi-value kpi-sm">${settPct}%</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check',12)} ${onTimeSettl} of ${GSAS.length} current</span>
          <span class="kpi-attain ${parseFloat(settPct)>=80?'over':'under'}">${settPct}%</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${settPct}%"></div></div>
      </div>

      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('activity', 11)} Avg Booking Accuracy</div>
        <div class="kpi-value kpi-sm">${avgAcc}%</div>
        <div class="kpi-footer">
          <span class="kpi-delta ${parseFloat(avgAcc)>=95?'up':'flat'}">${icon('target',12)} Network standard: 95%</span>
        </div>
        <div class="kpi-progress"><div class="kpi-progress-fill" style="width:${avgAcc}%"></div></div>
      </div>

    </div>

    <!-- ── CASS Chart ──────────────────────────────────────────────── -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-header">
        <span class="card-title">${icon('bar-chart-2', 14)} CASS Balances by GSA</span>
        <div style="display:flex;align-items:center;gap:8px">
          <select class="form-select form-select-sm" onchange="gsaFilterRag(this.value)">
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

    <!-- ── GSA Directory Table ─────────────────────────────────────── -->
    <div class="table-wrap">
      <div class="table-header">
        <div>
          <div class="table-title">${icon('list', 14)} GSA Directory</div>
          <div class="table-count">${GSAS.length} active agents</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="position:relative">
            <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--mid)">${icon('search',13)}</span>
            <input type="text" class="form-input form-input-sm" placeholder="Search GSA or station…"
              oninput="gsaSearch(this.value)"
              style="padding-left:30px;width:200px">
          </div>
        </div>
      </div>
      <div class="table-scroll">
        <table id="gsa-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Company</th>
              <th>Station</th>
              <th class="th-num">CASS Balance</th>
              <th>RAG Status</th>
              <th class="th-num">Booking Acc.</th>
              <th class="th-num">Revenue MTD</th>
              <th>Trend</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${GSAS.map((g, i) => {
              const cassHi = (g.cassBalance||0) > 100_000;
              const cassAmb = (g.cassBalance||0) > 50_000;
              return `
              <tr>
                <td><code class="td-mono">${esc(g.code)}</code></td>
                <td>
                  <div style="font-weight:700;font-size:12px;color:var(--heading)">${esc(g.name)}</div>
                  <div style="font-size:11px;color:var(--mid)">${esc(g.contact||'')}</div>
                </td>
                <td><span class="badge badge-blue badge-sm">${esc(g.station)}</span></td>
                <td class="td-num">
                  <strong style="color:${cassHi?'var(--red)':cassAmb?'var(--amber)':'var(--heading)'}">
                    ${g.cassBalance ? formatNumber(g.cassBalance,'currency') : '—'}
                  </strong>
                </td>
                <td>${ragBadge(g.rag)}</td>
                <td class="td-num">${accBadge(g.bookingAccuracy || 90)}</td>
                <td class="td-num td-strong">${formatNumber(g.revenueMTD || 0,'currency')}</td>
                <td>
                  <canvas id="gsa-spark-${i}" width="80" height="28" style="display:block"></canvas>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" onclick="gsaViewDetail('${esc(g.code)}')">
                      ${icon('eye',12)} View
                    </button>
                    ${(g.cassBalance||0)>0
                      ? `<button class="btn btn-sec btn-sm" onclick="gsaSendStatement('${esc(g.code)}')">
                           ${icon('send',12)} Statement
                         </button>`
                      : ''}
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
  // CASS bar chart
  const sorted = [...GSAS].filter(g => g.cassBalance > 0)
    .sort((a,b) => b.cassBalance - a.cassBalance).slice(0, 8);
  buildBarChart('gsa-cass-chart',
    sorted.map(g => g.name.length > 22 ? g.name.slice(0,20)+'…' : g.name),
    [{
      label: 'CASS Outstanding ($)',
      data:  sorted.map(g => g.cassBalance),
      backgroundColor: sorted.map(g =>
        g.rag === 'RED' ? '#DC2626' : g.rag === 'AMBER' ? '#D97706' : '#16A34A'),
      borderRadius: 4,
    }],
    { indexAxis:'y', plugins:{ legend:{ display:false } } }
  );

  // Sparklines
  GSAS.forEach((g, i) => {
    const canvas = container.querySelector(`#gsa-spark-${i}`);
    if (!canvas || !window.Chart) return;
    const vals = g.monthlyTrend || [80000,95000,88000,102000,97000,g.revenueMTD||0];
    buildSparkline(`gsa-spark-${i}`, vals, g.rag === 'RED' ? '#DC2626' : '#00529B');
  });

  // Handlers
  window.gsaSearch = (v) => {
    const q = v.toLowerCase();
    container.querySelectorAll('#gsa-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
  window.gsaFilterRag      = (v) => showToast('Filter applied', 'info', v ? `RAG: ${v}` : 'All statuses', 1500);
  window.gsaExport         = () => { showToast('Exporting…', 'info'); setTimeout(() => showToast('GSA report downloaded', 'success'), 1600); };
  window.gsaSendStatements = () => showToast('Statements queued', 'success', 'Email statements sent to all active GSAs', 3000);
  window.gsaSendStatement  = (code) => showToast(`Statement sent — ${code}`, 'success', 'CASS statement dispatched', 3000);
  window.gsaViewDetail     = (code) => showToast(`GSA Detail — ${code}`, 'info', 'Full detail view coming soon', 2000);
}

export const handler = { render, init };
