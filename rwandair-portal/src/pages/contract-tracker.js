// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Contract Tracker
// Bank Guarantees · GSA · GHA · Contract Rates · BSA · SPA
// ═══════════════════════════════════════════════════════════════════

import { CONTRACTS, CONTRACT_TYPES, CONTRACT_STATUSES, getByType, getByStatus, getExpiringSoon, getTotalValue, daysUntilExpiry, getTypeInfo, getStatusInfo } from '../data/contracts.js';
import { formatDate, formatNumber, esc } from '../utils/format.js';
import { icon } from '../utils/icons.js';
import { showToast } from '../components/toast.js';
import { doughnutChart, barChart as buildBarChart, destroyChart } from '../utils/charts.js';

// ── Module state ──────────────────────────────────────────────────
let _activeTab = 'all';
let _searchQuery = '';
let _statusFilter = '';
let _expanded = new Set();
let _modalStep = 1;

// ── Filtered data ─────────────────────────────────────────────────
function getFiltered() {
  let list = [...CONTRACTS];
  if (_activeTab !== 'all') list = list.filter(c => c.type === _activeTab);
  if (_statusFilter) list = list.filter(c => c.status === _statusFilter);
  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    list = list.filter(c =>
      c.party.toLowerCase().includes(q) ||
      c.partyCode.toLowerCase().includes(q) ||
      c.station.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }
  // Sort: expiring first, then by expiry date
  list.sort((a, b) => {
    const order = { expired: 0, expiring: 1, 'under-review': 2, pending: 3, active: 4 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });
  return list;
}

// ── KPI computations ──────────────────────────────────────────────
function computeKPIs() {
  const total = CONTRACTS.length;
  const active = getByStatus('active').length;
  const expiring = getExpiringSoon(90).length;
  const expired = getByStatus('expired').length;
  const pending = getByStatus('pending').length + getByStatus('under-review').length;
  const totalVal = getTotalValue(CONTRACTS);
  return { total, active, expiring, expired, pending, totalVal };
}

// ── Days-left badge ───────────────────────────────────────────────
function daysLeftBadge(contract) {
  const d = daysUntilExpiry(contract);
  if (contract.status === 'expired' || d < 0) return `<span class="badge badge-red badge-sm">Expired</span>`;
  if (d <= 30) return `<span class="badge badge-red badge-sm">${d}d</span>`;
  if (d <= 90) return `<span class="badge badge-amber badge-sm">${d}d</span>`;
  return `<span class="badge badge-green badge-sm">${d}d</span>`;
}

// ── Status badge ──────────────────────────────────────────────────
function statusBadge(status) {
  const s = getStatusInfo(status);
  if (!s) return status;
  return `<span class="badge badge-sm" style="background:${s.color}18;color:${s.color};border:1px solid ${s.color}30">${s.label}</span>`;
}

// ── Type badge ────────────────────────────────────────────────────
function typeBadge(type) {
  const t = getTypeInfo(type);
  if (!t) return type;
  return `<span class="badge badge-sm" style="background:${t.color}15;color:${t.color};font-weight:600">${t.label}</span>`;
}

// ── Expand row detail ─────────────────────────────────────────────
function expandedDetail(c) {
  const t = getTypeInfo(c.type);
  let details = '';

  // Common fields
  details += `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px 24px;font-size:12px">
      <div><span style="color:var(--mid);font-weight:600">Contract ID</span><br><span class="mono" style="font-size:11px">${c.id}</span></div>
      <div><span style="color:var(--mid);font-weight:600">Contact</span><br>${esc(c.contactName)}<br><a href="mailto:${esc(c.contactEmail)}" style="color:var(--rw-teal);font-size:11px">${esc(c.contactEmail)}</a></div>
      <div><span style="color:var(--mid);font-weight:600">Region</span><br>${c.region}</div>
      <div><span style="color:var(--mid);font-weight:600">Renewal</span><br>${c.renewalType}</div>
      <div><span style="color:var(--mid);font-weight:600">Currency</span><br>${c.currency}</div>`;

  // Type-specific fields
  if (c.type === 'bank-guarantee') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Guarantee Bank</span><br>${esc(c.guaranteeBank || '-')}</div>
      <div><span style="color:var(--mid);font-weight:600">Bank Reference</span><br><span class="mono" style="font-size:11px">${esc(c.guaranteeRef || '-')}</span></div>`;
  }
  if (c.type === 'gsa') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Territory</span><br>${esc(c.territory || '-')}</div>
      <div><span style="color:var(--mid);font-weight:600">Commission</span><br>${c.commissionPct || 0}%</div>
      <div><span style="color:var(--mid);font-weight:600">Revenue Target</span><br>${formatNumber(c.revenueTarget || 0, 'currency')}/mo</div>
      <div><span style="color:var(--mid);font-weight:600">Exclusivity</span><br>${c.exclusivity ? 'Exclusive' : 'Non-exclusive'}</div>`;
  }
  if (c.type === 'gha') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Stations</span><br>${(c.handlingStations || []).join(', ')}</div>
      <div><span style="color:var(--mid);font-weight:600">Services</span><br>${(c.services || []).join(', ')}</div>
      <div><span style="color:var(--mid);font-weight:600">Rate/kg</span><br>$${c.ratePerKg || 0}</div>
      <div><span style="color:var(--mid);font-weight:600">Min Monthly</span><br>${formatNumber(c.minimumMonthly || 0, 'currency')}</div>`;
  }
  if (c.type === 'contract-rate') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Routes</span><br>${(c.routes || []).join(', ')}</div>
      <div><span style="color:var(--mid);font-weight:600">Rate/kg</span><br>$${c.ratePerKg || 0}</div>
      <div><span style="color:var(--mid);font-weight:600">Min Volume</span><br>${formatNumber(c.minimumVolume || 0, 'number')} ${c.volumeUnit || ''}</div>`;
  }
  if (c.type === 'bsa') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Routes</span><br>${(c.routes || []).join(', ')}</div>
      <div><span style="color:var(--mid);font-weight:600">Block Space</span><br>${formatNumber(c.blockSpace || 0, 'number')} kg</div>
      <div><span style="color:var(--mid);font-weight:600">Frequency</span><br>${c.frequency || '-'}</div>
      <div><span style="color:var(--mid);font-weight:600">Aircraft</span><br>${c.aircraft || '-'}</div>
      <div><span style="color:var(--mid);font-weight:600">Utilization</span><br>${c.utilizationPct || 0}%</div>`;
  }
  if (c.type === 'spa') {
    details += `
      <div><span style="color:var(--mid);font-weight:600">Routes</span><br>${(c.routes || []).join(', ')}</div>
      <div><span style="color:var(--mid);font-weight:600">Prorate Factor</span><br>${c.prorateFactor || 0}</div>
      <div><span style="color:var(--mid);font-weight:600">Method</span><br>${c.prorateMethod || '-'}</div>
      <div><span style="color:var(--mid);font-weight:600">Interline</span><br>${c.interlinePartner ? 'Yes' : 'No'}</div>`;
  }

  details += `</div>`;

  // Notes
  if (c.notes) {
    details += `<div style="margin-top:12px;padding:10px 14px;background:var(--smoke);border-radius:8px;font-size:12px;color:var(--body);line-height:1.6">
      <strong style="color:var(--heading)">Notes:</strong> ${esc(c.notes)}
    </div>`;
  }

  return details;
}

// ══════════════════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════════════════
export function render() {
  const k = computeKPIs();
  const filtered = getFiltered();
  const activePct = k.total > 0 ? ((k.active / k.total) * 100).toFixed(1) : 0;

  return `<div class="page-wrap">

    <!-- Header -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('contract', 18)}</span>
        <div>
          <div class="portal-header-title">Contract Tracker</div>
          <div class="portal-header-sub">6 types · ${k.total} agreements · Total value ${formatNumber(k.totalVal, 'currency')} · ${formatDate(new Date(), 'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" onclick="contractExport()">
          ${icon('download', 13)} Export
        </button>
        <button class="btn btn-pri btn-sm" onclick="openNewContractModal()">
          ${icon('plus', 13)} New Contract
        </button>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(6,1fr)">
      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('file-text', 11)} Total Contracts</div>
        <div class="kpi-value kpi-sm">${k.total}</div>
        <div class="kpi-footer"><span class="kpi-delta">6 types tracked</span></div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('check-circle', 11)} Active</div>
        <div class="kpi-value kpi-sm">${k.active}</div>
        <div class="kpi-footer"><span class="kpi-delta up">${activePct}% of portfolio</span></div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-label">${icon('clock', 11)} Expiring &lt;90d</div>
        <div class="kpi-value kpi-sm">${k.expiring}</div>
        <div class="kpi-footer"><span class="kpi-delta ${k.expiring > 0 ? 'down' : ''}">Renewal action needed</span></div>
      </div>
      <div class="kpi-card kpi-red">
        <div class="kpi-label">${icon('alert-circle', 11)} Expired</div>
        <div class="kpi-value kpi-sm">${k.expired}</div>
        <div class="kpi-footer"><span class="kpi-delta ${k.expired > 0 ? 'down' : ''}">Requires attention</span></div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('dollar-sign', 11)} Total Value</div>
        <div class="kpi-value kpi-sm">${formatNumber(k.totalVal, 'currency')}</div>
        <div class="kpi-footer"><span class="kpi-delta">Guarantees + contracts</span></div>
      </div>
      <div class="kpi-card kpi-navy">
        <div class="kpi-label">${icon('edit', 11)} Pending Review</div>
        <div class="kpi-value kpi-sm">${k.pending}</div>
        <div class="kpi-footer"><span class="kpi-delta">Awaiting approval</span></div>
      </div>
    </div>

    <!-- Two-column layout: table + charts -->
    <div class="two-col-layout">

      <!-- Main table area -->
      <div style="flex:3;min-width:0">
        <div class="card">
          <!-- Tab bar + filters -->
          <div class="card-header" style="flex-wrap:wrap;gap:8px">
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <button class="btn btn-sm ${_activeTab === 'all' ? 'btn-pri' : 'btn-ghost'}" onclick="contractTabFilter('all')">All (${CONTRACTS.length})</button>
              ${CONTRACT_TYPES.map(t => {
                const count = getByType(t.id).length;
                return `<button class="btn btn-sm ${_activeTab === t.id ? 'btn-pri' : 'btn-ghost'}" onclick="contractTabFilter('${t.id}')">${t.short} (${count})</button>`;
              }).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-left:auto;align-items:center">
              <div style="position:relative">
                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--mid)">${icon('search', 13)}</span>
                <input type="text" class="form-input form-input-sm" id="contract-search"
                  placeholder="Search party, station, ID…"
                  value="${esc(_searchQuery)}"
                  oninput="contractSearch(this.value)"
                  style="padding-left:30px;width:200px">
              </div>
              <select class="form-select form-select-sm" id="contract-status-filter" onchange="contractStatusFilter(this.value)">
                <option value="">All Status</option>
                ${CONTRACT_STATUSES.map(s => `<option value="${s.id}" ${_statusFilter === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Data table -->
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:22%">Party</th>
                  <th>Type</th>
                  <th>Station</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>Expiry</th>
                  <th style="text-align:right">Value</th>
                  <th style="text-align:center">Days Left</th>
                  <th style="width:140px">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--mid)">No contracts match the current filters</td></tr>` : ''}
                ${filtered.map(c => {
                  const isOpen = _expanded.has(c.id);
                  return `
                    <tr class="${isOpen ? 'row-active' : ''}" style="cursor:pointer" onclick="toggleContractRow('${esc(c.id)}')">
                      <td>
                        <div style="font-weight:600;color:var(--heading)">${esc(c.party)}</div>
                        <div style="font-size:11px;color:var(--mid)">${c.partyCode} · ${c.region}</div>
                      </td>
                      <td>${typeBadge(c.type)}</td>
                      <td><span class="mono" style="font-size:12px;font-weight:600">${c.station}</span></td>
                      <td>${statusBadge(c.status)}</td>
                      <td style="font-size:12px">${formatDate(new Date(c.startDate), 'short')}</td>
                      <td style="font-size:12px">${formatDate(new Date(c.expiryDate), 'short')}</td>
                      <td style="text-align:right;font-family:var(--mono);font-size:12px;font-weight:500">${c.value > 0 ? formatNumber(c.value, 'currency') : '—'}</td>
                      <td style="text-align:center">${daysLeftBadge(c)}</td>
                      <td>
                        <div class="row-actions" onclick="event.stopPropagation()">
                          <button class="btn btn-ghost btn-sm" onclick="contractView('${esc(c.id)}')" title="View details">
                            ${icon('eye', 12)}
                          </button>
                          ${c.status === 'expiring' || c.status === 'expired' ? `
                            <button class="btn btn-sec btn-sm" onclick="contractRenew('${esc(c.id)}')" title="Renew">
                              ${icon('refresh', 12)}
                            </button>` : ''}
                          <button class="btn btn-ghost btn-sm" onclick="contractReminder('${esc(c.id)}')" title="Send reminder">
                            ${icon('send', 12)}
                          </button>
                        </div>
                      </td>
                    </tr>
                    ${isOpen ? `<tr class="expand-row"><td colspan="9" style="padding:16px 20px;background:var(--white);border-top:1px solid var(--border)">${expandedDetail(c)}</td></tr>` : ''}
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding:12px 16px;font-size:11px;color:var(--mid);border-top:1px solid var(--border)">
            Showing ${filtered.length} of ${CONTRACTS.length} contracts
          </div>
        </div>
      </div>

      <!-- Sidebar charts -->
      <div style="flex:1;display:flex;flex-direction:column;gap:16px;min-width:260px">
        <!-- Status Breakdown -->
        <div class="card">
          <div class="card-header"><span class="card-title">Status Breakdown</span></div>
          <div class="card-body" style="padding:12px">
            <canvas id="contract-status-chart" height="200"></canvas>
          </div>
        </div>

        <!-- Value by Type -->
        <div class="card">
          <div class="card-header"><span class="card-title">Value by Type</span></div>
          <div class="card-body" style="padding:12px">
            <canvas id="contract-value-chart" height="220"></canvas>
          </div>
        </div>

        <!-- Expiry Timeline -->
        <div class="card">
          <div class="card-header"><span class="card-title">Expiry Timeline</span></div>
          <div class="card-body" style="padding:12px">
            <canvas id="contract-expiry-chart" height="180"></canvas>
          </div>
        </div>
      </div>

    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════
// INIT — charts + interactivity
// ══════════════════════════════════════════════════════════════════
export function init(container) {
  // ── Status doughnut ────────────────────────────────────────────
  const statusCounts = {};
  CONTRACT_STATUSES.forEach(s => { statusCounts[s.label] = 0; });
  CONTRACTS.forEach(c => {
    const s = getStatusInfo(c.status);
    if (s) statusCounts[s.label]++;
  });
  const statusLabels = Object.keys(statusCounts).filter(k => statusCounts[k] > 0);
  const statusData = statusLabels.map(k => statusCounts[k]);
  const statusColors = statusLabels.map(k => CONTRACT_STATUSES.find(s => s.label === k)?.color || '#999');

  if (container.querySelector('#contract-status-chart')) {
    doughnutChart('contract-status-chart', statusLabels, statusData, statusColors);
  }

  // ── Value by type bar ──────────────────────────────────────────
  const typeValues = CONTRACT_TYPES.map(t => ({
    label: t.short,
    value: getTotalValue(getByType(t.id)),
    color: t.color,
  })).filter(t => t.value > 0);

  if (container.querySelector('#contract-value-chart')) {
    buildBarChart('contract-value-chart',
      typeValues.map(t => t.label),
      [{ label: 'Value ($)', data: typeValues.map(t => t.value), backgroundColor: typeValues.map(t => t.color + '99') }],
      { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { ticks: { callback: v => '$' + (v / 1000) + 'K' } } } }
    );
  }

  // ── Expiry timeline ────────────────────────────────────────────
  const now = new Date();
  const months = [];
  const monthlyCounts = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    months.push(label);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = CONTRACTS.filter(c => {
      const exp = new Date(c.expiryDate);
      return exp >= d && exp <= monthEnd;
    }).length;
    monthlyCounts.push(count);
  }

  if (container.querySelector('#contract-expiry-chart')) {
    buildBarChart('contract-expiry-chart',
      months,
      [{ label: 'Expiring', data: monthlyCounts, backgroundColor: monthlyCounts.map(v => v > 0 ? '#D9770699' : '#DDE3EE99') }],
      { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    );
  }
}

// ══════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ══════════════════════════════════════════════════════════════════

window.toggleContractRow = function(id) {
  if (_expanded.has(id)) _expanded.delete(id);
  else _expanded.add(id);
  if (typeof window.navigate === 'function') {
    // Re-render in place
    const main = document.getElementById('main-content');
    if (main) { main.innerHTML = render(); init(main); }
  }
};

window.contractTabFilter = function(tab) {
  _activeTab = tab;
  _expanded.clear();
  const main = document.getElementById('main-content');
  if (main) { main.innerHTML = render(); init(main); }
};

window.contractSearch = function(q) {
  _searchQuery = q;
  _expanded.clear();
  const main = document.getElementById('main-content');
  if (main) { main.innerHTML = render(); init(main); }
};

window.contractStatusFilter = function(status) {
  _statusFilter = status;
  _expanded.clear();
  const main = document.getElementById('main-content');
  if (main) { main.innerHTML = render(); init(main); }
};

window.contractView = function(id) {
  const c = CONTRACTS.find(x => x.id === id);
  if (!c) return;
  _expanded.clear();
  _expanded.add(id);
  const main = document.getElementById('main-content');
  if (main) { main.innerHTML = render(); init(main); }
  // Scroll to the row
  setTimeout(() => {
    const row = document.querySelector('.expand-row');
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
};

window.contractRenew = function(id) {
  const c = CONTRACTS.find(x => x.id === id);
  if (!c) return;
  showToast('Renewal Initiated', 'success', `${c.party} — ${getTypeInfo(c.type)?.label || c.type} renewal workflow started`, 4000);
};

window.contractReminder = function(id) {
  const c = CONTRACTS.find(x => x.id === id);
  if (!c) return;
  showToast('Reminder Sent', 'info', `Email sent to ${c.contactEmail}`, 3000);
};

window.contractExport = function() {
  showToast('Exporting…', 'info', 'Contract report generating as CSV', 2000);
};

// ── New Contract Modal ────────────────────────────────────────────
window.openNewContractModal = function() {
  _modalStep = 1;
  _renderNewContractModal();
};

function _renderNewContractModal() {
  const steps = [
    { n: 1, label: 'Type & Party' },
    { n: 2, label: 'Dates & Value' },
    { n: 3, label: 'Details' },
    { n: 4, label: 'Review' },
  ];

  const stepsHtml = `<div class="booking-steps" style="margin-bottom:20px">
    ${steps.map(s => `
      <div class="booking-step ${s.n < _modalStep ? 'done' : ''} ${s.n === _modalStep ? 'active' : ''}">
        <div class="step-num">${s.n < _modalStep ? icon('check-circle', 12) : s.n}</div>
        <div class="step-label">${s.label}</div>
      </div>
    `).join('<div class="step-line"></div>')}
  </div>`;

  let body = '';
  if (_modalStep === 1) {
    body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <label class="form-label">Contract Type</label>
          <select class="form-control" id="nc-type">
            ${CONTRACT_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Party / Company</label>
          <input type="text" class="form-control" id="nc-party" placeholder="e.g. Al Rais Cargo LLC">
        </div>
        <div>
          <label class="form-label">Party Code</label>
          <input type="text" class="form-control" id="nc-code" placeholder="e.g. ARC" maxlength="6">
        </div>
        <div>
          <label class="form-label">Station (IATA)</label>
          <input type="text" class="form-control" id="nc-station" placeholder="e.g. DXB" maxlength="3">
        </div>
        <div>
          <label class="form-label">Region</label>
          <select class="form-control" id="nc-region">
            <option>Africa</option><option>Europe</option><option>Middle East</option><option>Asia</option><option>Americas</option>
          </select>
        </div>
        <div>
          <label class="form-label">Contact Email</label>
          <input type="email" class="form-control" id="nc-email" placeholder="contact@company.com">
        </div>
      </div>`;
  } else if (_modalStep === 2) {
    body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <label class="form-label">Start Date</label>
          <input type="date" class="form-control" id="nc-start">
        </div>
        <div>
          <label class="form-label">Expiry Date</label>
          <input type="date" class="form-control" id="nc-expiry">
        </div>
        <div>
          <label class="form-label">Contract Value</label>
          <input type="number" class="form-control" id="nc-value" placeholder="0">
        </div>
        <div>
          <label class="form-label">Currency</label>
          <select class="form-control" id="nc-currency">
            <option>USD</option><option>EUR</option><option>GBP</option><option>RWF</option>
          </select>
        </div>
        <div>
          <label class="form-label">Renewal Type</label>
          <select class="form-control" id="nc-renewal">
            <option value="annual">Annual</option>
            <option value="multi-year">Multi-Year</option>
            <option value="auto-renew">Auto-Renew</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>
        <div>
          <label class="form-label">Contact Name</label>
          <input type="text" class="form-control" id="nc-contact" placeholder="Full name">
        </div>
      </div>`;
  } else if (_modalStep === 3) {
    body = `
      <div style="display:grid;grid-template-columns:1fr;gap:16px">
        <div>
          <label class="form-label">Routes / Sectors (comma-separated)</label>
          <input type="text" class="form-control" id="nc-routes" placeholder="e.g. KGL-DXB, DXB-KGL">
        </div>
        <div>
          <label class="form-label">Services / Scope</label>
          <input type="text" class="form-control" id="nc-services" placeholder="e.g. Warehouse, Ramp, Documentation">
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea class="form-control" id="nc-notes" rows="3" placeholder="Additional contract details or conditions…"></textarea>
        </div>
      </div>`;
  } else {
    body = `
      <div style="background:var(--smoke);border-radius:10px;padding:20px;font-size:13px">
        <h4 style="margin-bottom:12px;font-weight:700">Contract Summary</h4>
        <p style="color:var(--body);line-height:1.7">
          New contract record will be created with the details provided in the previous steps.
          The contract will be set to <strong>Pending</strong> status until reviewed and approved
          by a Commercial Manager.
        </p>
        <div style="margin-top:12px;padding:12px;background:var(--white);border-radius:8px;border:1px solid var(--border)">
          ${icon('check-circle', 14)} Ready to submit
        </div>
      </div>`;
  }

  import('../components/modals.js').then(m => {
    m.openModal('New Contract',
      stepsHtml + '<div class="modal-body-inner">' + body + '</div>',
      `<button class="btn btn-sec" onclick="${_modalStep > 1 ? 'ncPrev()' : 'closeModal()'}">
        ${_modalStep > 1 ? '← Back' : 'Cancel'}
      </button>
      <button class="btn btn-pri" onclick="${_modalStep < 4 ? 'ncNext()' : 'ncSubmit()'}">
        ${_modalStep < 4 ? 'Next →' : 'Submit Contract'}
      </button>`
    );
  });
}

window.ncNext = () => { _modalStep = Math.min(4, _modalStep + 1); _renderNewContractModal(); };
window.ncPrev = () => { _modalStep = Math.max(1, _modalStep - 1); _renderNewContractModal(); };
window.ncSubmit = () => {
  window.closeModal();
  const ref = 'CTR-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900) + 100);
  showToast('Contract Created', 'success', `Reference: ${ref} — pending review`, 5000);
};

// ── Handler export ────────────────────────────────────────────────
export const handler = { render, init };
