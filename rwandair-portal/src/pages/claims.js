// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Claims Management Page
// 10 claims, 4-step file claim form, status stepper, donut chart
// ═══════════════════════════════════════════════════════════════════

import { CLAIMS_DATA } from '../data/claims.js';
import { formatDate, formatNumber, esc } from '../utils/format.js';
import { doughnutChart } from '../utils/charts.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

const STATUS_ORDER = ['Filed', 'Under Investigation', 'Station Response', 'Resolved'];
let _expanded = new Set();
let _fileStep = 1;
let _fileData = {};

const SEV_COLORS = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--teal)' };

export function render() {
  const total = CLAIMS_DATA.reduce((s, c) => s + c.valueUSD, 0);
  const open = CLAIMS_DATA.filter(c => c.status !== 'Resolved').length;
  const resolved = CLAIMS_DATA.filter(c => c.status === 'Resolved').length;
  const highValue = CLAIMS_DATA.filter(c => c.valueUSD > 10000).length;

  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('file-minus', 18)}</span>
        <div>
          <div class="portal-header-title">Claims Management</div>
          <div class="portal-header-sub">${CLAIMS_DATA.length} claims · Total exposure ${formatNumber(total, 'currency')} · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-pri btn-sm" onclick="openFileClaimModal()">
          ${icon('plus', 13)} File Claim
        </button>
      </div>
    </div>

    <!-- ── 4-KPI strip ─────────────────────────────────────────────── -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">

      <div class="kpi-card kpi-red">
        <div class="kpi-label">${icon('alert-circle', 11)} Open Claims</div>
        <div class="kpi-value kpi-sm">${open}</div>
        <div class="kpi-footer">
          <span class="kpi-delta down">${icon('clock',12)} Pending resolution</span>
        </div>
      </div>

      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('check-circle', 11)} Resolved</div>
        <div class="kpi-value kpi-sm">${resolved}</div>
        <div class="kpi-footer">
          <span class="kpi-delta up">${icon('check',12)} Closed successfully</span>
        </div>
      </div>

      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('dollar-sign', 11)} Total Exposure</div>
        <div class="kpi-value kpi-sm">${formatNumber(total, 'currency')}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('bar-chart',12)} All claim types</span>
        </div>
      </div>

      <div class="kpi-card kpi-amber">
        <div class="kpi-label">${icon('alert-triangle', 11)} High Value (&gt;$10k)</div>
        <div class="kpi-value kpi-sm">${highValue}</div>
        <div class="kpi-footer">
          <span class="kpi-delta">${icon('eye',12)} Requires senior review</span>
        </div>
      </div>

    </div>

  <div class="two-col-layout">
    <div style="flex:3">
      <div class="card">
        <table class="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Ref</th><th>AWB</th><th>Type</th>
              <th>Station</th><th>Value</th><th>Status</th>
              <th>Assignee</th><th>Filed</th>
            </tr>
          </thead>
          <tbody>
            ${CLAIMS_DATA.map(c => {
              const sev = SEV_COLORS[c.severity] || 'var(--mid)';
              const statusIdx = STATUS_ORDER.indexOf(c.status);
              const expanded = _expanded.has(c.ref);
              return `
              <tr class="table-row" onclick="toggleClaimRow('${c.ref}')">
                <td><button class="expand-btn">${expanded ? '▼' : '▶'}</button></td>
                <td class="mono text-sm">${esc(c.ref)}</td>
                <td class="mono text-sm">${esc(c.awb)}</td>
                <td><span class="badge" style="background:${sev}20;color:${sev}">${esc(c.type)}</span></td>
                <td>${esc(c.station)}</td>
                <td><strong>${formatNumber(c.valueUSD, 'currency')}</strong></td>
                <td>
                  <div class="status-stepper-mini">
                    ${STATUS_ORDER.map((s, i) => `
                      <div class="mini-step ${i <= statusIdx ? 'done' : ''} ${i === statusIdx ? 'active' : ''}" title="${s}"></div>
                      ${i < STATUS_ORDER.length - 1 ? `<div class="mini-line ${i < statusIdx ? 'done' : ''}"></div>` : ''}
                    `).join('')}
                  </div>
                  <div class="text-sm text-mid">${esc(c.status)}</div>
                </td>
                <td class="text-sm">${esc(c.assignedTo)}</td>
                <td class="text-sm">${formatDate(c.filedDate, 'short')}</td>
              </tr>
              ${expanded ? `
              <tr class="expand-row">
                <td colspan="9">
                  <div class="expand-content">
                    <div class="expand-grid">
                      <div><span class="text-mid">Route</span><br><strong>${esc(c.route)}</strong></div>
                      <div><span class="text-mid">Incident Date</span><br><strong>${formatDate(c.incidentDate,'short')}</strong></div>
                      <div><span class="text-mid">Severity</span><br><strong style="color:${sev}">${esc(c.severity.toUpperCase())}</strong></div>
                    </div>
                    <div class="expand-section">
                      <strong>Description</strong>
                      <p class="text-sm">${esc(c.description)}</p>
                    </div>
                    <div class="expand-section">
                      <strong>Resolution</strong>
                      <p class="text-sm">${esc(c.resolution)}</p>
                    </div>
                    <div class="expand-actions">
                      <button class="btn btn-sec btn-sm" onclick="showToast('Status update sent','info','Notification dispatched to shipper','3000')">Send Update</button>
                      ${c.status !== 'Resolved' ? `<button class="btn btn-pri btn-sm" onclick="resolveClaimAction('${c.ref}')">Mark Resolved</button>` : ''}
                    </div>
                  </div>
                </td>
              </tr>` : ''}`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Chart sidebar -->
    <div style="flex:1;display:flex;flex-direction:column;gap:16px">
      <div class="card">
        <h3 class="card-title">Claims by Type</h3>
        <div style="height:220px"><canvas id="claims-donut"></canvas></div>
      </div>
      <div class="card">
        <h3 class="card-title">By Status</h3>
        ${STATUS_ORDER.map(s => {
          const n = CLAIMS_DATA.filter(c => c.status === s).length;
          const val = CLAIMS_DATA.filter(c => c.status === s).reduce((sum, c) => sum + c.valueUSD, 0);
          return `<div class="detail-row">
            <span>${s}</span>
            <div style="text-align:right">
              <strong>${n}</strong>
              <div class="text-mid text-sm">${formatNumber(val,'currency')}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>
  </div>`;
}

export function init(container) {
  const types = {};
  CLAIMS_DATA.forEach(c => { types[c.type] = (types[c.type] || 0) + c.valueUSD; });
  const labels = Object.keys(types);
  const data = Object.values(types);
  doughnutChart('claims-donut', labels, data,
    ['var(--red)', 'var(--amber)', 'var(--teal)', 'var(--navy)', 'var(--lime)']);
}

window.toggleClaimRow = function(ref) {
  if (_expanded.has(ref)) _expanded.delete(ref); else _expanded.add(ref);
  // Re-render just the tbody is complex; re-render the page section
  const tbody = document.querySelector('#claims-donut')?.closest('.card')?.parentElement?.parentElement?.querySelector('tbody');
  if (!tbody) { document.getElementById('main-content')?.dispatchEvent(new Event('refresh')); return; }
  // Simpler approach: full re-render
  import('./claims.js').then(m => {
    const main = document.getElementById('main-content');
    if (main) { main.innerHTML = m.render(); setTimeout(() => m.init(main), 10); }
  });
};

window.resolveClaimAction = function(ref) {
  const claim = CLAIMS_DATA.find(c => c.ref === ref);
  if (claim) claim.status = 'Resolved';
  showToast('Claim resolved', 'success', `${ref} marked as resolved`, 3000);
  import('./claims.js').then(m => {
    const main = document.getElementById('main-content');
    if (main) { main.innerHTML = m.render(); setTimeout(() => m.init(main), 10); }
  });
};

window.openFileClaimModal = function() {
  _fileStep = 1;
  _fileData = {};
  _renderFileClaimModal();
};

function _renderFileClaimModal() {
  const steps = [
    { n:1, label:'AWB & Route' },
    { n:2, label:'Incident Details' },
    { n:3, label:'Claimant Info' },
    { n:4, label:'Review' },
  ];
  const stepsHtml = `<div class="booking-steps">${steps.map(s => `
    <div class="booking-step ${s.n===_fileStep?'active':s.n<_fileStep?'done':''}">
      <div class="step-num">${s.n < _fileStep ? '✓' : s.n}</div>
      <div class="step-label">${s.label}</div>
    </div>${s.n < 4 ? '<div class="step-connector"></div>' : ''}
  `).join('')}</div>`;

  let body = '';
  if (_fileStep === 1) {
    body = `<div class="form-grid">
      <div class="form-group"><label class="form-label">AWB Number *</label><input type="text" class="form-control" placeholder="459-XXXXXXXX" onchange="updateFileData('awb',this.value)"></div>
      <div class="form-group"><label class="form-label">Claim Type *</label>
        <select class="form-control" onchange="updateFileData('type',this.value)">
          <option>Damage</option><option>Pilferage</option><option>Loss</option>
          <option>Delay</option><option>Short Delivery</option><option>Temperature Excursion</option>
        </select></div>
      <div class="form-group"><label class="form-label">Origin</label><input type="text" class="form-control" placeholder="e.g. NBO" maxlength="3" onchange="updateFileData('origin',this.value)"></div>
      <div class="form-group"><label class="form-label">Destination</label><input type="text" class="form-control" placeholder="e.g. LHR" maxlength="3" onchange="updateFileData('dest',this.value)"></div>
    </div>`;
  } else if (_fileStep === 2) {
    body = `<div class="form-grid">
      <div class="form-group"><label class="form-label">Incident Date *</label><input type="date" class="form-control" value="2026-03-11" onchange="updateFileData('incidentDate',this.value)"></div>
      <div class="form-group"><label class="form-label">Station *</label><input type="text" class="form-control" placeholder="e.g. NBO" onchange="updateFileData('station',this.value)"></div>
      <div class="form-group"><label class="form-label">Claim Value (USD) *</label><input type="number" class="form-control" placeholder="5000" onchange="updateFileData('value',this.value)"></div>
      <div class="form-group"><label class="form-label">Severity</label>
        <select class="form-control" onchange="updateFileData('severity',this.value)">
          <option>low</option><option>medium</option><option>high</option>
        </select></div>
      <div class="form-group span-2"><label class="form-label">Incident Description *</label>
        <textarea class="form-control" rows="3" placeholder="Describe what happened..." onchange="updateFileData('description',this.value)"></textarea></div>
    </div>`;
  } else if (_fileStep === 3) {
    body = `<div class="form-grid">
      <div class="form-group"><label class="form-label">Claimant Name *</label><input type="text" class="form-control" placeholder="Company or person" onchange="updateFileData('claimant',this.value)"></div>
      <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-control" placeholder="claims@company.com" onchange="updateFileData('email',this.value)"></div>
      <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" placeholder="+254 20 …" onchange="updateFileData('phone',this.value)"></div>
      <div class="form-group"><label class="form-label">Assigned To</label>
        <select class="form-control" onchange="updateFileData('assignee',this.value)">
          <option>J. Kamau</option><option>F. Osei</option><option>M. Wanjiru</option><option>A. Ndayishimiye</option>
        </select></div>
    </div>`;
  } else {
    body = `<div class="review-grid">
      <div class="review-section">
        <h4>Claim Summary</h4>
        <div class="review-row"><span>AWB</span><strong class="mono">${esc(_fileData.awb||'—')}</strong></div>
        <div class="review-row"><span>Type</span><strong>${esc(_fileData.type||'Damage')}</strong></div>
        <div class="review-row"><span>Route</span><strong>${esc(_fileData.origin||'—')}→${esc(_fileData.dest||'—')}</strong></div>
        <div class="review-row"><span>Station</span><strong>${esc(_fileData.station||'—')}</strong></div>
        <div class="review-row"><span>Value</span><strong>${formatNumber(parseFloat(_fileData.value)||0,'currency')}</strong></div>
        <div class="review-row"><span>Claimant</span><strong>${esc(_fileData.claimant||'—')}</strong></div>
        <div class="review-row"><span>Assignee</span><strong>${esc(_fileData.assignee||'J. Kamau')}</strong></div>
      </div>
    </div>`;
  }

  import('../components/modals.js').then(m => {
    m.openModal('File New Claim',
      stepsHtml + '<div class="modal-body-inner">' + body + '</div>',
      `<button class="btn btn-sec" onclick="${_fileStep>1?'fileClaimPrev()':'closeModal()'}">
        ${_fileStep>1?'← Back':'Cancel'}
       </button>
       <button class="btn btn-pri" onclick="${_fileStep<4?'fileClaimNext()':'submitClaim()'}">
        ${_fileStep<4?'Next →':'Submit Claim'}
       </button>`
    );
  });
}

window.updateFileData = (k, v) => { _fileData[k] = v; };
window.fileClaimNext = () => { _fileStep = Math.min(4, _fileStep + 1); _renderFileClaimModal(); };
window.fileClaimPrev = () => { _fileStep = Math.max(1, _fileStep - 1); _renderFileClaimModal(); };
window.submitClaim = () => {
  window.closeModal();
  const ref = `CLM-2026-${String(CLAIMS_DATA.length + 1).padStart(3,'0')}`;
  showToast('Claim filed successfully', 'success', `Reference: ${ref} — assigned to ${_fileData.assignee || 'J. Kamau'}`, 6000);
};

export const handler = { render, init };
