// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Disruption Management
// Card-based disruption workflow with rebooking & resolution
// ═══════════════════════════════════════════════════════════════════

import { DISRUPTIONS, DISRUPTION_TYPES, DISRUPTION_STATUSES, getActiveDisruptions, getDisruptionsByStatus, getDisruptionById } from '../data/disruptions.js';
import { formatDate, formatNumber, esc } from '../utils/format.js';
import { icon } from '../utils/icons.js';
import { showToast, toastSuccess, toastWarning } from '../components/toast.js';
import { doughnutChart, destroyChart } from '../utils/charts.js';
import { getAwbStaff, staffBadgesHtml } from '../data/staff.js';
import { openModal } from '../components/modals.js';

// ── Module state ────────────────────────────────────────────────
let _activeTab = 'all';
let _searchQuery = '';
let _priorityFilter = '';
let _expanded = new Set();

// ── Filtered data ───────────────────────────────────────────────
function getFiltered() {
  let list = [...DISRUPTIONS];

  if (_activeTab === 'new') list = list.filter(d => d.status === 'New');
  else if (_activeTab === 'pending') list = list.filter(d => ['Notified', 'Options Sent', 'Client Confirmed'].includes(d.status));
  else if (_activeTab === 'rebooked') list = list.filter(d => d.status === 'Rebooked');
  else if (_activeTab === 'resolved') list = list.filter(d => d.status === 'Resolved');

  if (_priorityFilter) {
    list = list.filter(d => d.priority === _priorityFilter);
  }

  if (_searchQuery) {
    const q = _searchQuery.toLowerCase();
    list = list.filter(d =>
      d.awb.toLowerCase().includes(q) ||
      d.shipper.toLowerCase().includes(q) ||
      d.consignee.toLowerCase().includes(q) ||
      d.originalFlight.toLowerCase().includes(q) ||
      d.station.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q)
    );
  }

  // Sort: Critical first, then High, then Medium; within same priority, newest first
  const priOrder = { Critical: 0, High: 1, Medium: 2 };
  list.sort((a, b) => {
    if (priOrder[a.priority] !== priOrder[b.priority]) return priOrder[a.priority] - priOrder[b.priority];
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return list;
}

// ── KPI computations ────────────────────────────────────────────
function computeKPIs() {
  const active = getActiveDisruptions().length;
  const pendingRebook = DISRUPTIONS.filter(d => ['New', 'Notified', 'Options Sent'].includes(d.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const resolvedToday = DISRUPTIONS.filter(d => d.resolvedAt && d.resolvedAt.slice(0, 10) === today).length;
  return { active, pendingRebook, resolvedToday };
}

// ── Tab counts ──────────────────────────────────────────────────
function tabCounts() {
  return {
    all: DISRUPTIONS.length,
    new: getDisruptionsByStatus('New').length,
    pending: DISRUPTIONS.filter(d => ['Notified', 'Options Sent', 'Client Confirmed'].includes(d.status)).length,
    rebooked: getDisruptionsByStatus('Rebooked').length,
    resolved: getDisruptionsByStatus('Resolved').length
  };
}

// ── Badge helpers ───────────────────────────────────────────────
function priorityBadge(priority) {
  const colors = { Critical: '#E53E3E', High: '#D97706', Medium: '#2563EB' };
  const c = colors[priority] || '#6B7280';
  return `<span class="badge badge-sm" style="background:${c}18;color:${c};border:1px solid ${c}30;font-weight:600">${priority}</span>`;
}

function statusBadge(status) {
  const s = DISRUPTION_STATUSES[status];
  if (!s) return status;
  return `<span class="badge badge-sm" style="background:${s.bg};color:${s.color};border:1px solid ${s.color}30">${s.label}</span>`;
}

function typeBadge(dtype) {
  const t = DISRUPTION_TYPES[dtype];
  if (!t) return dtype;
  return `<span class="badge badge-sm" style="background:${t.color}15;color:${t.color};font-weight:600">${icon(t.icon, 10)} ${t.label}</span>`;
}

// ── Action button per status ────────────────────────────────────
function actionButton(d) {
  switch (d.status) {
    case 'New':
      return `<button class="btn btn-pri btn-sm" onclick="event.stopPropagation();disruptionAction('${esc(d.id)}','notify')">
        ${icon('send', 12)} Notify Client
      </button>`;
    case 'Notified':
      return `<button class="btn btn-pri btn-sm" onclick="event.stopPropagation();disruptionAction('${esc(d.id)}','sendOptions')">
        ${icon('list', 12)} Send Options
      </button>`;
    case 'Options Sent':
      return `<button class="btn btn-pri btn-sm" onclick="event.stopPropagation();disruptionAction('${esc(d.id)}','confirmOption')" id="confirm-btn-${d.id}">
        ${icon('check-circle', 12)} Confirm Selected
      </button>`;
    case 'Client Confirmed':
      return `<button class="btn btn-pri btn-sm" onclick="event.stopPropagation();disruptionAction('${esc(d.id)}','rebook')">
        ${icon('refresh', 12)} Process Rebook
      </button>`;
    case 'Rebooked':
      return `<button class="btn btn-pri btn-sm" onclick="event.stopPropagation();disruptionAction('${esc(d.id)}','resolve')">
        ${icon('check-circle', 12)} Mark Resolved
      </button>`;
    case 'Resolved':
      return `<span class="text-mid text-sm">${icon('check-circle', 12)} Closed</span>`;
    default:
      return '';
  }
}

// ── Expanded card detail ────────────────────────────────────────
function expandedDetail(d) {
  const isOptionSelect = d.status === 'Options Sent';

  // Rebooking options table
  let optionsHtml = `
    <div style="margin-bottom:16px">
      <div style="font-weight:600;font-size:13px;color:var(--heading);margin-bottom:8px">${icon('list', 13)} Rebooking Options</div>
      <div style="overflow-x:auto">
        <table class="data-table" style="font-size:12px">
          <thead>
            <tr>
              ${isOptionSelect ? '<th style="width:40px">Select</th>' : ''}
              <th>Flight</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Available</th>
              <th>ETA</th>
              <th style="text-align:right">Extra Cost</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${d.rebookingOptions.map((opt, idx) => `
              <tr style="${d.selectedOption === idx ? 'background:var(--rw-teal)08' : ''}">
                ${isOptionSelect ? `
                  <td>
                    <input type="radio" name="rebook-${d.id}" value="${idx}"
                      ${d.selectedOption === idx ? 'checked' : ''}
                      onchange="event.stopPropagation();selectRebookOption('${esc(d.id)}',${idx})">
                  </td>` : ''}
                <td class="mono" style="font-weight:600">${esc(opt.flight)}</td>
                <td>${esc(opt.route)}</td>
                <td>${formatDate(opt.departure, 'datetime')}</td>
                <td>${formatNumber(opt.availableKg)} kg</td>
                <td>${formatDate(opt.eta, 'datetime')}</td>
                <td style="text-align:right;font-family:var(--mono)">${opt.additionalCost > 0 ? '+$' + formatNumber(opt.additionalCost) : 'No charge'}</td>
                <td>${opt.recommended ? '<span class="badge badge-sm" style="background:#05966918;color:#059669;font-weight:600">Recommended</span>' : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  // Timeline
  let timelineHtml = '';
  if (d.notes && d.notes.length > 0) {
    timelineHtml = `
      <div style="margin-top:16px">
        <div style="font-weight:600;font-size:13px;color:var(--heading);margin-bottom:10px">${icon('clock', 13)} Activity Timeline</div>
        <div class="timeline">
          ${d.notes.map((note, idx) => {
            const isLast = idx === d.notes.length - 1;
            const dotColor = note.action === 'Resolved' ? 'var(--green)' :
                             note.action === 'Disruption Created' ? 'var(--red)' :
                             note.action.includes('Confirmed') ? 'var(--purple, #7C3AED)' :
                             'var(--teal)';
            return `
              <div class="timeline-item">
                <div class="timeline-dot" style="background:${dotColor};${isLast ? 'box-shadow:0 0 0 4px ' + dotColor + '30' : ''}"></div>
                <div class="timeline-content">
                  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                    <span style="font-weight:600;font-size:12px;color:var(--heading)">${esc(note.action)}</span>
                    <span style="font-size:11px;color:var(--mid)">${formatDate(note.time, 'datetime')}</span>
                    <span style="font-size:11px;color:var(--teal)">by ${esc(note.by)}</span>
                  </div>
                  <div style="font-size:12px;color:var(--body);margin-top:2px;line-height:1.5">${esc(note.detail)}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  return optionsHtml + timelineHtml;
}

// ── Render a single disruption card ─────────────────────────────
function renderCard(d) {
  const isOpen = _expanded.has(d.id);
  const staff = getAwbStaff(d.awb);

  return `
  <div class="card" style="margin-bottom:12px;${d.priority === 'Critical' ? 'border-left:3px solid #E53E3E' : d.priority === 'High' ? 'border-left:3px solid #D97706' : 'border-left:3px solid #2563EB'}">
    <div class="card-header" style="cursor:pointer;flex-wrap:wrap;gap:8px" onclick="toggleDisruptionCard('${esc(d.id)}')">
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
        <span class="mono" style="font-weight:700;font-size:14px;color:var(--heading)">${esc(d.awb)}</span>
        ${typeBadge(d.disruptionType)}
        ${priorityBadge(d.priority)}
        ${statusBadge(d.status)}
      </div>
      <div style="display:flex;align-items:center;gap:8px" onclick="event.stopPropagation()">
        ${actionButton(d)}
      </div>
    </div>
    <div class="card-body" style="padding:12px 16px">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px 20px;font-size:12px">
        <div>
          <span style="color:var(--mid);font-weight:600">Original Flight</span><br>
          <span class="mono" style="font-weight:600">${esc(d.originalFlight)}</span>
        </div>
        <div>
          <span style="color:var(--mid);font-weight:600">Station</span><br>
          <span class="mono" style="font-weight:600">${esc(d.station)}</span>
        </div>
        <div>
          <span style="color:var(--mid);font-weight:600">Weight</span><br>
          ${formatNumber(d.weight)} kg
        </div>
        <div>
          <span style="color:var(--mid);font-weight:600">Commodity</span><br>
          ${esc(d.commodity)} <span class="badge-small">${esc(d.shc)}</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px 20px;font-size:12px;margin-top:8px">
        <div>
          <span style="color:var(--mid);font-weight:600">Shipper</span><br>
          ${esc(d.shipper)}
        </div>
        <div>
          <span style="color:var(--mid);font-weight:600">Consignee</span><br>
          ${esc(d.consignee)}
        </div>
        <div>
          <span style="color:var(--mid);font-weight:600">Time</span><br>
          ${formatDate(d.timestamp, 'datetime')}
        </div>
      </div>
      <div style="margin-top:8px;font-size:12px">
        <span style="color:var(--mid);font-weight:600">Reason:</span>
        <span style="color:var(--body)">${esc(d.reason)}</span>
      </div>
      <div style="margin-top:8px">
        ${staffBadgesHtml(staff)}
      </div>
    </div>
    ${isOpen ? `
      <div style="padding:16px;border-top:1px solid var(--border);background:var(--smoke)">
        ${expandedDetail(d)}
      </div>` : ''}
  </div>`;
}

// ══════════════════════════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════════════════════════
export function render() {
  const k = computeKPIs();
  const tc = tabCounts();
  const filtered = getFiltered();

  return `<div class="page-wrap">

    <!-- Header -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('alert-triangle', 18)}</span>
        <div>
          <div class="portal-header-title">Disruption Management</div>
          <div class="portal-header-sub">${k.active} active disruption${k.active !== 1 ? 's' : ''} · ${formatDate(new Date(), 'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <button class="btn btn-ghost btn-sm" onclick="disruptionExport()">
          ${icon('download', 13)} Export Report
        </button>
      </div>
    </div>

    <!-- KPI Strip -->
    <div class="kpi-strip stagger" style="grid-template-columns:repeat(4,1fr)">
      <div class="kpi-card kpi-red">
        <div class="kpi-label">${icon('alert-circle', 11)} Active Disruptions</div>
        <div class="kpi-value kpi-sm">${k.active}</div>
        <div class="kpi-footer"><span class="kpi-delta ${k.active > 0 ? 'down' : ''}">Requires attention</span></div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-label">${icon('clock', 11)} Pending Rebooking</div>
        <div class="kpi-value kpi-sm">${k.pendingRebook}</div>
        <div class="kpi-footer"><span class="kpi-delta ${k.pendingRebook > 0 ? 'down' : ''}">Awaiting resolution</span></div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-label">${icon('check-circle', 11)} Resolved Today</div>
        <div class="kpi-value kpi-sm">${k.resolvedToday}</div>
        <div class="kpi-footer"><span class="kpi-delta up">Successfully handled</span></div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-label">${icon('clock', 11)} Avg Resolution</div>
        <div class="kpi-value kpi-sm">2.4 hrs</div>
        <div class="kpi-footer"><span class="kpi-delta up">Below 4hr target</span></div>
      </div>
    </div>

    <!-- Two-column: cards + chart -->
    <div class="two-col-layout">

      <!-- Main card area -->
      <div style="flex:3;min-width:0">
        <div class="card">
          <!-- Tab bar + filters -->
          <div class="card-header" style="flex-wrap:wrap;gap:8px">
            <div style="display:flex;gap:4px;flex-wrap:wrap">
              <button class="btn btn-sm ${_activeTab === 'all' ? 'btn-pri' : 'btn-ghost'}" onclick="disruptionTab('all')">All (${tc.all})</button>
              <button class="btn btn-sm ${_activeTab === 'new' ? 'btn-pri' : 'btn-ghost'}" onclick="disruptionTab('new')">New (${tc.new})</button>
              <button class="btn btn-sm ${_activeTab === 'pending' ? 'btn-pri' : 'btn-ghost'}" onclick="disruptionTab('pending')">Pending Action (${tc.pending})</button>
              <button class="btn btn-sm ${_activeTab === 'rebooked' ? 'btn-pri' : 'btn-ghost'}" onclick="disruptionTab('rebooked')">Rebooked (${tc.rebooked})</button>
              <button class="btn btn-sm ${_activeTab === 'resolved' ? 'btn-pri' : 'btn-ghost'}" onclick="disruptionTab('resolved')">Resolved (${tc.resolved})</button>
            </div>
            <div style="display:flex;gap:8px;margin-left:auto;align-items:center">
              <div style="position:relative">
                <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--mid)">${icon('search', 13)}</span>
                <input type="text" class="form-input form-input-sm" id="disruption-search"
                  placeholder="Search AWB, shipper, flight\u2026"
                  value="${esc(_searchQuery)}"
                  oninput="disruptionSearch(this.value)"
                  style="padding-left:30px;width:200px">
              </div>
              <select class="form-select form-select-sm" id="disruption-priority-filter" onchange="disruptionPriorityFilter(this.value)">
                <option value="">All Priority</option>
                <option value="Critical" ${_priorityFilter === 'Critical' ? 'selected' : ''}>Critical</option>
                <option value="High" ${_priorityFilter === 'High' ? 'selected' : ''}>High</option>
                <option value="Medium" ${_priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Disruption cards -->
        <div id="disruption-cards" style="margin-top:12px">
          ${filtered.length === 0
            ? `<div class="card"><div class="card-body" style="text-align:center;padding:40px;color:var(--mid)">${icon('check-circle', 24)}<div style="margin-top:8px">No disruptions match the current filters</div></div></div>`
            : filtered.map(d => renderCard(d)).join('')
          }
        </div>

        <div style="padding:12px 0;font-size:11px;color:var(--mid)">
          Showing ${filtered.length} of ${DISRUPTIONS.length} disruptions
        </div>
      </div>

      <!-- Sidebar chart -->
      <div style="flex:1;display:flex;flex-direction:column;gap:16px;min-width:260px">
        <div class="card">
          <div class="card-header"><span class="card-title">Status Breakdown</span></div>
          <div class="card-body" style="padding:12px">
            <canvas id="disruption-status-chart" height="220"></canvas>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">By Type</span></div>
          <div class="card-body" style="padding:12px">
            <canvas id="disruption-type-chart" height="200"></canvas>
          </div>
        </div>
      </div>

    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════
export function init(container) {
  // Status doughnut chart
  const statusCounts = {};
  Object.keys(DISRUPTION_STATUSES).forEach(s => { statusCounts[s] = 0; });
  DISRUPTIONS.forEach(d => { statusCounts[d.status]++; });
  const statusLabels = Object.keys(statusCounts).filter(k => statusCounts[k] > 0);
  const statusData = statusLabels.map(k => statusCounts[k]);
  const statusColors = statusLabels.map(k => DISRUPTION_STATUSES[k]?.color || '#999');

  if (container.querySelector('#disruption-status-chart')) {
    doughnutChart('disruption-status-chart', statusLabels, statusData, statusColors);
  }

  // Type doughnut chart
  const typeCounts = {};
  Object.keys(DISRUPTION_TYPES).forEach(t => { typeCounts[t] = 0; });
  DISRUPTIONS.forEach(d => { typeCounts[d.disruptionType]++; });
  const typeLabels = Object.keys(typeCounts).filter(k => typeCounts[k] > 0);
  const typeData = typeLabels.map(k => typeCounts[k]);
  const typeColors = typeLabels.map(k => DISRUPTION_TYPES[k]?.color || '#999');

  if (container.querySelector('#disruption-type-chart')) {
    doughnutChart('disruption-type-chart', typeLabels, typeData, typeColors);
  }

  // Listen for live disruption events from alert engine
  document.addEventListener('cargo-disruption', _onCargoDisruption);
}

function _onCargoDisruption(e) {
  const disruption = e.detail;
  if (!disruption || !disruption.awb) return;

  // Check if already in the list
  const exists = DISRUPTIONS.find(d => d.awb === disruption.awb && d.status === 'New');
  if (exists) return;

  // Add the new disruption to the array
  DISRUPTIONS.unshift({
    id: disruption.id || 'DIS-LIVE-' + Date.now(),
    awb: disruption.awb,
    originalFlight: disruption.originalFlight || 'Unknown',
    disruptionType: disruption.disruptionType || 'Offloaded',
    reason: disruption.reason || 'Offloaded from flight',
    station: disruption.station || 'KGL',
    timestamp: disruption.timestamp || new Date().toISOString(),
    status: 'New',
    shipper: 'Pending Identification',
    consignee: 'Pending Identification',
    weight: disruption.weight || 0,
    commodity: 'Pending Classification',
    shc: 'GEN',
    priority: disruption.priority || 'High',
    rebookingOptions: [],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: new Date().toISOString(), action: 'Disruption Created', by: 'Alert Engine', detail: `Live alert: ${disruption.reason || 'AWB offloaded'}` }
    ]
  });

  // Re-render
  _rerender();
}

// ── Re-render helper ────────────────────────────────────────────
function _rerender() {
  const main = document.getElementById('main-content');
  if (main) {
    main.innerHTML = render();
    init(main);
  }
}

// ══════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ══════════════════════════════════════════════════════════════════

window.disruptionTab = function(tab) {
  _activeTab = tab;
  _expanded.clear();
  _rerender();
};

window.disruptionSearch = function(q) {
  _searchQuery = q;
  _expanded.clear();
  _rerender();
};

window.disruptionPriorityFilter = function(p) {
  _priorityFilter = p;
  _expanded.clear();
  _rerender();
};

window.toggleDisruptionCard = function(id) {
  if (_expanded.has(id)) _expanded.delete(id);
  else _expanded.add(id);
  _rerender();
};

window.selectRebookOption = function(id, optIdx) {
  const d = getDisruptionById(id);
  if (!d) return;
  d.selectedOption = optIdx;
};

window.disruptionAction = function(id, action) {
  const d = getDisruptionById(id);
  if (!d) return;

  const now = new Date().toISOString();

  switch (action) {
    case 'notify':
      d.status = 'Notified';
      d.notes.push({ time: now, action: 'Client Notified', by: 'Operations', detail: `${d.shipper} notified of disruption via email and phone.` });
      toastSuccess('Client Notified', `${d.shipper} has been notified about AWB ${d.awb}`);
      break;

    case 'sendOptions':
      d.status = 'Options Sent';
      d.notes.push({ time: now, action: 'Options Sent', by: 'Operations', detail: `${d.rebookingOptions.length} rebooking options sent to client.` });
      toastSuccess('Options Sent', `${d.rebookingOptions.length} rebooking options sent for AWB ${d.awb}`);
      break;

    case 'confirmOption':
      if (d.selectedOption === null || d.selectedOption === undefined) {
        toastWarning('No Option Selected', 'Please select a rebooking option first');
        return;
      }
      d.status = 'Client Confirmed';
      d.clientResponse = 'Accepted';
      const selectedFlight = d.rebookingOptions[d.selectedOption]?.flight || 'Unknown';
      d.notes.push({ time: now, action: 'Client Confirmed', by: 'Operations', detail: `Client confirmed Option ${d.selectedOption + 1}: ${selectedFlight}.` });
      toastSuccess('Option Confirmed', `Client confirmed rebooking on ${selectedFlight}`);
      break;

    case 'rebook':
      d.status = 'Rebooked';
      const rebookFlight = d.selectedOption !== null ? d.rebookingOptions[d.selectedOption]?.flight : 'N/A';
      d.notes.push({ time: now, action: 'Rebooked', by: 'Operations', detail: `AWB ${d.awb} rebooked on ${rebookFlight}. Processing complete.` });
      toastSuccess('Rebooked', `AWB ${d.awb} rebooked successfully`);
      break;

    case 'resolve':
      d.status = 'Resolved';
      d.resolvedAt = now;
      d.notes.push({ time: now, action: 'Resolved', by: 'Operations', detail: `Disruption resolved. AWB ${d.awb} case closed.` });
      toastSuccess('Resolved', `Disruption for AWB ${d.awb} has been resolved`);
      break;

    default:
      return;
  }

  _rerender();
};

window.disruptionExport = function() {
  showToast('Exporting\u2026', 'info', 'Disruption report generating as CSV', 2000);
};

// ── Handler export ──────────────────────────────────────────────
export const handler = { render, init };
