// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Reports
// ═══════════════════════════════════════════════════════════════════

import { formatDate, esc, formatNumber } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { FY_TOTAL_TARGET } from '../data/revenue.js';
import { icon } from '../utils/icons.js';

const REPORT_CATALOGUE = [
  {
    id:'monthly-cargo',
    icon:'📊',
    title:'Monthly Cargo Report',
    desc:'Full network cargo performance: uplift, revenue, yield, top commodities, GSA performance. Standard board-level format.',
    lastGenerated: '01 Mar 2026',
    frequency:'Monthly',
    tag:'Executive',
    tagClass:'badge-blue',
  },
  {
    id:'dwell-analysis',
    icon:'⏱️',
    title:'Dwell Analysis Report',
    desc:'Shipment dwell times by station, commodity, and airline. SLA compliance breakdown with root cause categorisation.',
    lastGenerated: '10 Mar 2026',
    frequency:'Weekly',
    tag:'Operations',
    tagClass:'badge-green',
  },
  {
    id:'gsa-performance',
    icon:'🤝',
    title:'GSA Performance Report',
    desc:'CASS settlement status, booking accuracy, revenue contribution and RAG rating for all active GSA agreements.',
    lastGenerated: '28 Feb 2026',
    frequency:'Monthly',
    tag:'Commercial',
    tagClass:'badge-gold',
  },
  {
    id:'yield-analysis',
    icon:'📈',
    title:'Yield Analysis Report',
    desc:'Revenue per kg by route, commodity and aircraft type. Yield trend against LY and budget. Pricing opportunities.',
    lastGenerated: '07 Mar 2026',
    frequency:'Weekly',
    tag:'Commercial',
    tagClass:'badge-gold',
  },
  {
    id:'revenue-target',
    icon:'💰',
    title:'Revenue vs Target Report',
    desc:'MTD and YTD revenue against FY 2025-26 targets by market. Forecast to year-end with variance commentary.',
    lastGenerated: '10 Mar 2026',
    frequency:'Daily',
    tag:'Executive',
    tagClass:'badge-blue',
  },
  {
    id:'dg-compliance',
    icon:'☢️',
    title:'DG Compliance Report',
    desc:'Dangerous goods shipments, NOTOC submission compliance, DG class breakdown and regulatory incident log.',
    lastGenerated: '03 Mar 2026',
    frequency:'Monthly',
    tag:'Safety',
    tagClass:'badge-red',
  },
  {
    id:'csr',
    icon:'📋',
    title:'Cargo Sales Report (CSR)',
    desc:'Station-level cargo sales summary: pieces, weight, revenue, agents, commodity breakdown and comparison to LY.',
    lastGenerated: '28 Feb 2026',
    frequency:'Monthly',
    tag:'Operations',
    tagClass:'badge-green',
  },
  {
    id:'temperature',
    icon:'🌡️',
    title:'Cold Chain Compliance Report',
    desc:'Temperature excursions, pharma/perishable SLA compliance, cool room performance and QA action log.',
    lastGenerated: '05 Mar 2026',
    frequency:'Weekly',
    tag:'Quality',
    tagClass:'badge-amber',
  },
  {
    id:'capacity',
    icon:'✈️',
    title:'Capacity Utilisation Report',
    desc:'Belly capacity utilisation by route, aircraft and week. Load factor trends, blocked space and offload analysis.',
    lastGenerated: '09 Mar 2026',
    frequency:'Weekly',
    tag:'Planning',
    tagClass:'badge-blue',
  },
];

function renderPreview(id) {
  const r = REPORT_CATALOGUE.find(r => r.id === id);
  if (!r) return '';

  // Generic preview template
  return `
  <div id="report-preview-${id}" class="report-preview" style="display:none;padding:24px;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-md);margin-top:12px">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid var(--navy)">
      <div>
        <div style="font-size:20px;font-weight:700;color:var(--navy)">RwandAir Cargo — ${esc(r.title)}</div>
        <div style="color:var(--mid);font-size:13px;margin-top:4px">Generated: ${formatDate(new Date(),'datetime')} UTC · Period: Mar 2026 MTD</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:22px">WB CARGO</div>
        <div style="font-size:11px;color:var(--mid)">cargo@rwandair.com</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px">
      <div style="background:var(--smoke);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:.5px">MTD Revenue</div>
        <div style="font-size:22px;font-weight:700;color:var(--navy);margin-top:4px">$2,841,200</div>
        <div style="font-size:12px;color:var(--green)">▲ 102.1% of target</div>
      </div>
      <div style="background:var(--smoke);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:.5px">Network Load Factor</div>
        <div style="font-size:22px;font-weight:700;color:var(--navy);margin-top:4px">79.2%</div>
        <div style="font-size:12px;color:var(--green)">▲ +3.1pp vs LY</div>
      </div>
      <div style="background:var(--smoke);border-radius:var(--radius-sm);padding:14px">
        <div style="font-size:11px;color:var(--mid);text-transform:uppercase;letter-spacing:.5px">YTD Revenue</div>
        <div style="font-size:22px;font-weight:700;color:var(--navy);margin-top:4px">$18,620,400</div>
        <div style="font-size:12px;color:var(--mid)">${formatNumber(FY_TOTAL_TARGET,'currency')} FY target</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="background:var(--navy);color:var(--white)">
          <th style="padding:8px 12px;text-align:left">Market</th>
          <th style="padding:8px 12px;text-align:right">Revenue MTD</th>
          <th style="padding:8px 12px;text-align:right">Target</th>
          <th style="padding:8px 12px;text-align:right">Attainment</th>
        </tr>
      </thead>
      <tbody>
        ${[
          ['Dubai / UAE','$731,398','$718,000','101.9%'],
          ['United Kingdom','$612,540','$598,000','102.4%'],
          ['Nigeria / West Africa','$428,190','$410,000','104.4%'],
          ['France','$318,760','$330,000','96.6%'],
          ['Kenya','$284,100','$279,000','101.8%'],
        ].map((row,i) => `
          <tr style="background:${i%2?'var(--smoke)':'var(--white)'}">
            <td style="padding:7px 12px">${row[0]}</td>
            <td style="padding:7px 12px;text-align:right;font-weight:600">${row[1]}</td>
            <td style="padding:7px 12px;text-align:right;color:var(--mid)">${row[2]}</td>
            <td style="padding:7px 12px;text-align:right;color:${parseFloat(row[3])>=100?'#1A8A4A':'#D97706'};font-weight:600">${row[3]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top:20px;padding-top:12px;border-top:1px solid var(--border);display:flex;justify-content:space-between">
      <button class="btn btn-pri" onclick="window.print()">🖨 Print</button>
      <button class="btn btn-sec" onclick="document.getElementById('report-preview-${id}').style.display='none'">Close Preview</button>
    </div>
  </div>`;
}

export function render() {
  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('file-text', 18)}</span>
        <div>
          <div class="portal-header-title">Reports</div>
          <div class="portal-header-sub">Standard cargo reporting library · ${REPORT_CATALOGUE.length} reports available · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <div style="position:relative">
          <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--mid)">${icon('search',13)}</span>
          <input class="form-input form-input-sm" placeholder="Search reports…" oninput="reportSearch(this.value)"
            style="padding-left:30px;width:200px">
        </div>
      </div>
    </div>

    <!-- Date Range Picker -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <span style="font-weight:600;font-size:13px">Report Period:</span>
        <div class="filter-group">
          <label class="form-label" style="margin:0;font-size:12px">From</label>
          <input type="date" class="form-input" id="rpt-date-from" value="2026-03-01" style="width:140px">
        </div>
        <div class="filter-group">
          <label class="form-label" style="margin:0;font-size:12px">To</label>
          <input type="date" class="form-input" id="rpt-date-to" value="2026-03-11" style="width:140px">
        </div>
        <div class="filter-group">
          <label class="form-label" style="margin:0;font-size:12px">Preset</label>
          <select class="form-select" style="width:140px" onchange="reportSetPreset(this.value)">
            <option>MTD</option>
            <option>Last Month</option>
            <option>Last Quarter</option>
            <option>YTD</option>
            <option>Full Year</option>
          </select>
        </div>
        <button class="btn btn-pri" onclick="reportApplyPeriod()">Apply Period</button>
      </div>
    </div>

    <!-- Report Grid -->
    <div id="report-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:16px">
      ${REPORT_CATALOGUE.map(r => `
        <div class="card report-card" data-title="${esc(r.title.toLowerCase())}">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">${r.icon}</span>
              <div>
                <div style="font-weight:700;font-size:14px">${esc(r.title)}</div>
                <div style="display:flex;gap:6px;margin-top:3px">
                  <span class="badge ${r.tagClass}">${esc(r.tag)}</span>
                  <span class="badge">${esc(r.frequency)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <p style="font-size:13px;color:var(--mid);line-height:1.5;margin-bottom:12px">${esc(r.desc)}</p>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:11px;color:var(--mid)">Last generated: ${r.lastGenerated}</span>
              <div style="display:flex;gap:8px">
                <button class="btn btn-ghost btn-sm" onclick="reportPreview('${r.id}')">Preview</button>
                <button class="btn btn-pri btn-sm" onclick="reportGenerate('${r.id}')">Generate</button>
              </div>
            </div>
          </div>
          ${renderPreview(r.id)}
        </div>
      `).join('')}
    </div>
  </div>`;
}

export function init(container) {
  window.reportSearch = (q) => {
    container.querySelectorAll('.report-card').forEach(card => {
      card.style.display = card.dataset.title.includes(q.toLowerCase()) ? '' : 'none';
    });
  };

  window.reportSetPreset = (preset) => {
    const today = new Date();
    let from = new Date();
    if (preset === 'MTD') { from = new Date(today.getFullYear(), today.getMonth(), 1); }
    else if (preset === 'Last Month') {
      from = new Date(today.getFullYear(), today.getMonth()-1, 1);
      today.setDate(0);
    }
    else if (preset === 'Last Quarter') { from.setMonth(today.getMonth()-3); }
    else if (preset === 'YTD') { from = new Date(2025, 6, 1); }
    else if (preset === 'Full Year') { from = new Date(2025, 6, 1); today.setFullYear(2026, 5, 30); }
    const fmt = d => d.toISOString().split('T')[0];
    const fromInput = document.getElementById('rpt-date-from');
    const toInput   = document.getElementById('rpt-date-to');
    if (fromInput) fromInput.value = fmt(from);
    if (toInput)   toInput.value   = fmt(today);
  };

  window.reportApplyPeriod = () => {
    const from = document.getElementById('rpt-date-from')?.value;
    const to   = document.getElementById('rpt-date-to')?.value;
    showToast('Period applied', 'info', `Reports will cover ${from} → ${to}`, 2000);
  };

  window.reportPreview = (id) => {
    // Hide all other previews
    container.querySelectorAll('.report-preview').forEach(el => {
      if (!el.id.endsWith(id)) el.style.display = 'none';
    });
    const el = container.querySelector(`#report-preview-${id}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
      if (el.style.display === 'block') el.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  };

  window.reportGenerate = (id) => {
    const r = REPORT_CATALOGUE.find(r => r.id === id);
    showToast(`Generating: ${r?.title}`, 'info', 'Report is being prepared…', 1500);
    setTimeout(() => {
      showToast(`${r?.title} ready`, 'success', 'Preview available. Use Print to export PDF.', 4000);
      window.reportPreview(id);
    }, 1600);
  };
}

export const handler = { render, init };
