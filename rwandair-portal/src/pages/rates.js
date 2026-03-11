// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Rate Cards Page
// Table from rates.js, filters, add rate modal, inline edit, calculator
// ═══════════════════════════════════════════════════════════════════

import { RATE_CARDS, SURCHARGES, CARGO_TYPES, calculateCharge } from '../data/rates.js';
import { formatDate, formatNumber, esc } from '../utils/format.js';
import { showToast } from '../components/toast.js';

let _filtered = [...RATE_CARDS];
let _editingId = null;
let _surchargeActive = { ...Object.fromEntries(SURCHARGES.map(s => [s.id, s.active])) };

export function render() {
  const origins = [...new Set(RATE_CARDS.map(r => r.origin))].sort();

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Rate Cards</h1>
      <p class="page-sub">Published rates effective W25 season · ${RATE_CARDS.length} routes</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-sec" onclick="showAddRateModal()">+ Add Rate</button>
      <button class="btn btn-pri" onclick="showToast('Rate file exported','success','XLSX download ready','3000')">Export</button>
    </div>
  </div>

  <div class="rates-layout">
    <!-- Main rate table -->
    <div style="flex:3">
      <div class="card filters-bar" style="margin-bottom:16px">
        <input type="search" class="form-control filter-search" placeholder="Search route, origin, destination…"
               oninput="filterRates(this.value)">
        <select class="form-control filter-select" onchange="filterRatesByOrigin(this.value)">
          <option value="">All Origins</option>
          ${origins.map(o => `<option>${o}</option>`).join('')}
        </select>
        <select class="form-control filter-select" onchange="filterRatesByCommodity(this.value)">
          <option value="">All Commodities</option>
          ${[...new Set(RATE_CARDS.map(r => r.commodity))].map(c => `<option>${c}</option>`).join('')}
        </select>
      </div>

      <div class="card">
        <table class="data-table" id="rates-table">
          <thead>
            <tr>
              <th>Origin</th><th>Destination</th><th>Commodity</th>
              <th class="text-right">Base Rate</th>
              <th class="text-right">Fuel Surch.</th>
              <th class="text-right">Security</th>
              <th class="text-right">Min Charge</th>
              <th>Effective</th><th>Expiry</th><th></th>
            </tr>
          </thead>
          <tbody id="rates-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- Sidebar: calculator + surcharges -->
    <div style="flex:1;display:flex;flex-direction:column;gap:16px">
      <!-- Rate calculator -->
      <div class="card">
        <h3 class="card-title">Quick Calculator</h3>
        <div class="form-group">
          <label class="form-label">Route</label>
          <select class="form-control" id="calc-route" onchange="calcUpdate()">
            <option value="">Select route</option>
            ${RATE_CARDS.map(r => `<option value="${r.id}">${r.origin}→${r.destination} (${r.commodity})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Gross Weight (kg)</label>
          <input type="number" class="form-control" id="calc-weight" min="1" placeholder="500" oninput="calcUpdate()">
        </div>
        <div class="form-group">
          <label class="form-label">Volume (CBM)</label>
          <input type="number" class="form-control" id="calc-cbm" min="0" step="0.01" placeholder="2.5" oninput="calcUpdate()">
        </div>
        <div id="calc-result" class="calc-result" style="display:none"></div>
        <button class="btn btn-pri" style="width:100%;margin-top:8px" onclick="saveCalcQuote()">Save Quote</button>
      </div>

      <!-- Surcharges -->
      <div class="card">
        <h3 class="card-title">Active Surcharges</h3>
        ${SURCHARGES.map(s => `
          <div class="surcharge-row">
            <div class="surcharge-toggle">
              <input type="checkbox" id="surch-${s.id}" ${_surchargeActive[s.id] ? 'checked' : ''}
                     onchange="toggleSurcharge('${s.id}',this.checked)">
              <label for="surch-${s.id}" class="surcharge-name">${s.name}</label>
            </div>
            <div class="surcharge-value">${s.type === 'percentage' ? s.value + '%' : '$' + s.value + ' ' + s.unit}</div>
          </div>
        `).join('')}
        <div class="text-mid text-sm" style="margin-top:12px">Effective: ${formatDate('2025-11-01','short')}</div>
      </div>
    </div>
  </div>
  `;
}

export function init() {
  _renderRatesTable();
}

function _renderRatesTable() {
  const tbody = document.getElementById('rates-tbody');
  if (!tbody) return;
  tbody.innerHTML = _filtered.map(r => {
    const isEditing = _editingId === r.id;
    return `
    <tr class="table-row ${isEditing ? 'editing' : ''}">
      <td><strong>${esc(r.origin)}</strong></td>
      <td><strong>${esc(r.destination)}</strong></td>
      <td class="text-sm">${esc(r.commodity)}</td>
      <td class="text-right">
        ${isEditing
          ? `<input type="number" class="inline-edit" id="edit-rate-${r.id}" value="${r.baseRate}" step="0.01" style="width:70px">`
          : `<strong>$${r.baseRate}</strong>`}
      </td>
      <td class="text-right">$${r.fuelSurch}</td>
      <td class="text-right">$${r.secSurch}/kg</td>
      <td class="text-right">$${r.minCharge}</td>
      <td class="text-sm">${formatDate(r.effectiveDate,'short')}</td>
      <td class="text-sm">${formatDate(r.expiryDate,'short')}</td>
      <td>
        ${isEditing
          ? `<button class="btn btn-pri btn-sm" onclick="saveInlineRate('${r.id}')">Save</button>
             <button class="btn btn-sec btn-sm" onclick="cancelEdit()">Cancel</button>`
          : `<button class="btn-icon" onclick="editRate('${r.id}')" title="Edit">✏</button>
             <button class="btn-icon" onclick="viewRateHistory('${r.id}')" title="History">📋</button>`
        }
      </td>
    </tr>`;
  }).join('');
}

window.filterRates = function(q) {
  const ql = q.toLowerCase();
  _filtered = RATE_CARDS.filter(r =>
    r.origin.toLowerCase().includes(ql) ||
    r.destination.toLowerCase().includes(ql) ||
    r.commodity.toLowerCase().includes(ql) ||
    r.id.toLowerCase().includes(ql)
  );
  _renderRatesTable();
};

window.filterRatesByOrigin = function(origin) {
  _filtered = origin ? RATE_CARDS.filter(r => r.origin === origin) : [...RATE_CARDS];
  _renderRatesTable();
};

window.filterRatesByCommodity = function(commodity) {
  _filtered = commodity ? RATE_CARDS.filter(r => r.commodity === commodity) : [...RATE_CARDS];
  _renderRatesTable();
};

window.editRate = function(id) { _editingId = id; _renderRatesTable(); };
window.cancelEdit = function() { _editingId = null; _renderRatesTable(); };

window.saveInlineRate = function(id) {
  const inp = document.getElementById(`edit-rate-${id}`);
  if (!inp) return;
  const newRate = parseFloat(inp.value);
  if (isNaN(newRate) || newRate <= 0) { showToast('Invalid rate value', 'error'); return; }
  const rate = RATE_CARDS.find(r => r.id === id);
  if (rate) {
    rate.history.unshift({ date: new Date().toISOString().slice(0,10), rate: rate.baseRate });
    rate.baseRate = newRate;
  }
  _editingId = null;
  _renderRatesTable();
  showToast('Rate updated', 'success', `${id}: $${newRate}/kg effective immediately`, 4000);
};

window.toggleSurcharge = function(id, active) {
  _surchargeActive[id] = active;
  showToast(`${id} surcharge ${active ? 'enabled' : 'disabled'}`, 'info', '', 2500);
};

window.calcUpdate = function() {
  const routeId = document.getElementById('calc-route')?.value;
  const weight = parseFloat(document.getElementById('calc-weight')?.value) || 0;
  const cbm = parseFloat(document.getElementById('calc-cbm')?.value) || 0;
  const resultEl = document.getElementById('calc-result');
  if (!resultEl) return;
  if (!routeId || weight <= 0) { resultEl.style.display = 'none'; return; }

  const calc = calculateCharge(routeId, weight, cbm);
  if (!calc) { resultEl.style.display = 'none'; return; }

  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div class="calc-row"><span>Chargeable kg</span><strong>${calc.chargeableKg} kg ${calc.volumetricUsed ? '(vol)' : '(actual)'}</strong></div>
    <div class="calc-row"><span>Freight</span><strong>$${calc.freight}</strong></div>
    <div class="calc-row"><span>Fuel Surch.</span><strong>$${calc.fuelSurch}</strong></div>
    <div class="calc-row"><span>Security</span><strong>$${calc.secSurch}</strong></div>
    <div class="calc-row"><span>AWB Fee</span><strong>$${calc.awbFee}</strong></div>
    <div class="calc-row total"><span>Total</span><strong>$${calc.total}</strong></div>
  `;
};

window.saveCalcQuote = function() {
  showToast('Quote saved to My Bookings', 'success', '', 2500);
};

window.viewRateHistory = function(id) {
  const rate = RATE_CARDS.find(r => r.id === id);
  if (!rate) return;
  import('../components/modals.js').then(m => {
    m.openModal(`Rate History — ${id}`,
      `<table class="data-table"><thead><tr><th>Date</th><th>Rate ($/kg)</th></tr></thead>
      <tbody>${(rate.history || []).map(h => `<tr><td>${formatDate(h.date,'short')}</td><td>$${h.rate}</td></tr>`).join('')}</tbody>
      </table>`,
      '<button class="btn btn-pri" onclick="closeModal()">Close</button>'
    );
  });
};

window.showAddRateModal = function() {
  import('../components/modals.js').then(m => {
    m.openModal('Add New Rate',
      `<div class="form-grid">
        <div class="form-group"><label class="form-label">Origin IATA</label><input type="text" class="form-control" id="nr-origin" placeholder="e.g. KGL" maxlength="3" style="text-transform:uppercase"></div>
        <div class="form-group"><label class="form-label">Destination IATA</label><input type="text" class="form-control" id="nr-dest" placeholder="e.g. LHR" maxlength="3" style="text-transform:uppercase"></div>
        <div class="form-group"><label class="form-label">Commodity</label><input type="text" class="form-control" id="nr-commodity" placeholder="General"></div>
        <div class="form-group"><label class="form-label">Base Rate ($/kg)</label><input type="number" class="form-control" id="nr-rate" min="0" step="0.01" placeholder="3.50"></div>
        <div class="form-group"><label class="form-label">Min Charge ($)</label><input type="number" class="form-control" id="nr-min" placeholder="170"></div>
        <div class="form-group"><label class="form-label">Effective Date</label><input type="date" class="form-control" id="nr-date" value="2026-04-01"></div>
      </div>`,
      `<button class="btn btn-sec" onclick="closeModal()">Cancel</button>
       <button class="btn btn-pri" onclick="submitNewRate()">Save Rate</button>`
    );
  });
};

window.submitNewRate = function() {
  const origin = document.getElementById('nr-origin')?.value?.toUpperCase();
  const dest = document.getElementById('nr-dest')?.value?.toUpperCase();
  const rate = parseFloat(document.getElementById('nr-rate')?.value);
  if (!origin || !dest || isNaN(rate)) { showToast('Please fill all required fields', 'warning'); return; }
  import('../components/modals.js').then(m => { m.closeModal?.(); window.closeModal(); });
  showToast('Rate added', 'success', `${origin}→${dest} $${rate}/kg — pending compliance review`, 4000);
};

export const handler = { render, init };
