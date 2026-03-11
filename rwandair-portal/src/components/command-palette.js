// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Command Palette (Cmd+K)
// Search AWBs, routes, stations, reports, and pages
// ═══════════════════════════════════════════════════════════════════

import { AWB_DATA } from '../data/awbs.js';
import { STATIONS } from '../data/stations.js';
import { FLIGHTS } from '../data/flights.js';

let _palettEl = null;
let _open = false;
let _activeIdx = 0;
let _results = [];
let _query = '';

// ── Page/command search index ─────────────────────────────────────

const PAGES = [
  { type: 'page', label: 'Space Search',       route: 'space-search',    icon: '🔍', desc: 'Search available cargo space on flights' },
  { type: 'page', label: 'My Bookings',         route: 'bookings',        icon: '📋', desc: 'View and manage cargo bookings' },
  { type: 'page', label: 'Track Shipment',      route: 'tracking',        icon: '📡', desc: 'Track AWB by number' },
  { type: 'page', label: 'Warehouse',           route: 'warehouse',       icon: '🏭', desc: 'Transit cargo and dwell management' },
  { type: 'page', label: 'Dwell Alerts',        route: 'dwell-alerts',    icon: '⏰', desc: 'SLA breach monitoring' },
  { type: 'page', label: 'Rate Cards',          route: 'rates',           icon: '💰', desc: 'Published rates and surcharges' },
  { type: 'page', label: 'Claims',              route: 'claims',          icon: '⚖', desc: 'Claims management and filing' },
  { type: 'page', label: 'Inbound Flights',     route: 'inbound',         icon: '🛬', desc: 'Arriving flights and manifests' },
  { type: 'page', label: 'Outbound Flights',    route: 'outbound',        icon: '🛫', desc: 'Departures and cargo closure' },
  { type: 'page', label: 'Dangerous Goods',     route: 'dangerous-goods', icon: '☢', desc: 'DG acceptance and NOTOC' },
  { type: 'page', label: 'Temperature Control', route: 'temperature',     icon: '🌡', desc: 'Pharma and perishable monitoring' },
  { type: 'page', label: 'Commercial Dashboard',route: 'commercial',      icon: '📊', desc: 'Revenue KPIs and market performance' },
  { type: 'page', label: 'GSA Performance',     route: 'gsa-performance', icon: '🤝', desc: 'Agent scorecard and CASS' },
  { type: 'page', label: 'Yield Analysis',      route: 'yield',           icon: '📈', desc: 'Yield by route and commodity' },
  { type: 'page', label: 'Capacity Planning',   route: 'capacity',        icon: '✈',  desc: 'Belly capacity allocation' },
  { type: 'page', label: 'Network Overview',    route: 'network',         icon: '🌍', desc: 'Station cards and alerts' },
  { type: 'page', label: 'Executive Dashboard', route: 'executive',       icon: '👔', desc: 'C-suite KPI summary' },
  { type: 'page', label: 'Reports',             route: 'reports',         icon: '📑', desc: 'Generate and schedule reports' },
];

const REPORTS = [
  { type: 'report', label: 'Monthly Revenue Report',   route: 'reports', icon: '📑', desc: 'FY 2025-26 revenue vs target' },
  { type: 'report', label: 'GSA CASS Statement',       route: 'gsa-performance', icon: '📑', desc: 'Outstanding balances by GSA' },
  { type: 'report', label: 'Dwell Exceptions Report',  route: 'dwell-alerts', icon: '📑', desc: 'SLA breaches last 30 days' },
  { type: 'report', label: 'Yield Analysis Report',    route: 'yield', icon: '📑', desc: 'Route yield vs target' },
];

// ── Search ────────────────────────────────────────────────────────

function _search(q) {
  if (!q.trim()) return [];
  const ql = q.toLowerCase().trim();
  const results = [];

  // AWBs
  AWB_DATA.forEach(a => {
    if (a.awb.toLowerCase().includes(ql) ||
        a.shipper.toLowerCase().includes(ql) ||
        a.commodity.toLowerCase().includes(ql) ||
        a.origin.toLowerCase().includes(ql) ||
        a.destination.toLowerCase().includes(ql)) {
      results.push({
        type: 'awb',
        label: a.awb,
        desc: `${a.origin}→${a.destination} · ${a.commodity} · ${a.weight}kg · ${a.status}`,
        icon: '📦',
        action: () => { window.location.hash = 'tracking'; setTimeout(() => { const inp = document.getElementById('track-input'); if (inp) { inp.value = a.awb; inp.closest('form')?.dispatchEvent(new Event('submit')); }}, 400); }
      });
    }
  });

  // Stations
  STATIONS.forEach(s => {
    if (s.code.toLowerCase().includes(ql) ||
        s.city.toLowerCase().includes(ql) ||
        s.country.toLowerCase().includes(ql)) {
      results.push({
        type: 'station',
        label: `${s.code} — ${s.city}`,
        desc: `${s.country} · ${s.region} · Load ${s.load}%`,
        icon: '📍',
        action: () => { window.location.hash = 'network'; }
      });
    }
  });

  // Flights
  FLIGHTS.slice(0, 20).forEach(f => {
    if (f.flight.toLowerCase().includes(ql) ||
        f.origin.toLowerCase().includes(ql) ||
        f.destination.toLowerCase().includes(ql)) {
      results.push({
        type: 'flight',
        label: f.flight,
        desc: `${f.origin}→${f.destination} · ${f.aircraft} · ${f.std}`,
        icon: '✈',
        action: () => { window.location.hash = 'space-search'; }
      });
    }
  });

  // Pages
  PAGES.forEach(p => {
    if (p.label.toLowerCase().includes(ql) || p.desc.toLowerCase().includes(ql)) {
      results.push({
        type: 'page',
        label: p.label,
        desc: p.desc,
        icon: p.icon,
        action: () => { window.location.hash = p.route; }
      });
    }
  });

  // Reports
  REPORTS.forEach(r => {
    if (r.label.toLowerCase().includes(ql)) {
      results.push({
        type: 'report',
        label: r.label,
        desc: r.desc,
        icon: r.icon,
        action: () => { window.location.hash = r.route; }
      });
    }
  });

  return results.slice(0, 12);
}

// ── Render ────────────────────────────────────────────────────────

function _render() {
  const typeLabels = { awb: 'AWB', station: 'Station', flight: 'Flight', page: 'Page', report: 'Report' };

  return `
  <div class="cp-backdrop" onclick="closePalette()"></div>
  <div class="cp-box">
    <div class="cp-search-row">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input id="cp-input" class="cp-input" placeholder="Search AWBs, stations, flights, pages…"
             autocomplete="off" spellcheck="false" value="${_query}">
      <kbd class="cp-esc" onclick="closePalette()">Esc</kbd>
    </div>
    <div class="cp-results" id="cp-results">
      ${_results.length === 0 && _query
        ? `<div class="cp-empty">No results for "<strong>${_query}</strong>"</div>`
        : _results.length === 0
          ? `<div class="cp-hint">
              <div class="cp-hint-row"><kbd>↑↓</kbd> navigate</div>
              <div class="cp-hint-row"><kbd>↵</kbd> select</div>
              <div class="cp-hint-row"><kbd>Esc</kbd> close</div>
            </div>`
          : _results.map((r, i) => `
            <div class="cp-item ${i === _activeIdx ? 'active' : ''}" data-idx="${i}"
                 onclick="selectResult(${i})">
              <span class="cp-item-icon">${r.icon}</span>
              <div class="cp-item-body">
                <div class="cp-item-label">${r.label}</div>
                <div class="cp-item-desc">${r.desc}</div>
              </div>
              <span class="cp-item-type">${typeLabels[r.type] || r.type}</span>
            </div>
          `).join('')
      }
    </div>
  </div>`;
}

// ── Public API ────────────────────────────────────────────────────

export function initCommandPalette() {
  _palettEl = document.getElementById('command-palette-root');
  if (!_palettEl) return;
}

export function openPalette() {
  if (!_palettEl) _palettEl = document.getElementById('command-palette-root');
  _open = true;
  _query = '';
  _results = [];
  _activeIdx = 0;
  _palettEl.innerHTML = _render();
  _palettEl.style.display = 'flex';

  const inp = document.getElementById('cp-input');
  if (inp) {
    inp.focus();
    inp.addEventListener('input', e => {
      _query = e.target.value;
      _results = _search(_query);
      _activeIdx = 0;
      const res = document.getElementById('cp-results');
      if (res) res.innerHTML = _render().match(/<div class="cp-results"[^>]*>([\s\S]*)<\/div>\s*<\/div>\s*<\/div>\s*$/)?.[0] || '';
      // Simpler: re-render just the results
      _palettEl.querySelector('#cp-results').innerHTML =
        _results.length === 0 && _query
          ? `<div class="cp-empty">No results for "<strong>${_query}</strong>"</div>`
          : _results.length === 0
            ? `<div class="cp-hint"><div class="cp-hint-row"><kbd>↑↓</kbd> navigate</div><div class="cp-hint-row"><kbd>↵</kbd> select</div><div class="cp-hint-row"><kbd>Esc</kbd> close</div></div>`
            : _results.map((r, i) => `
              <div class="cp-item ${i === _activeIdx ? 'active' : ''}" data-idx="${i}" onclick="selectResult(${i})">
                <span class="cp-item-icon">${r.icon}</span>
                <div class="cp-item-body">
                  <div class="cp-item-label">${r.label}</div>
                  <div class="cp-item-desc">${r.desc}</div>
                </div>
                <span class="cp-item-type">${({awb:'AWB',station:'Station',flight:'Flight',page:'Page',report:'Report'})[r.type]||r.type}</span>
              </div>
            `).join('');
    });

    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); _activeIdx = Math.min(_activeIdx + 1, _results.length - 1); _refreshItems(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); _activeIdx = Math.max(_activeIdx - 1, 0); _refreshItems(); }
      if (e.key === 'Enter')     { e.preventDefault(); selectResult(_activeIdx); }
      if (e.key === 'Escape')    { closePalette(); }
    });
  }
}

function _refreshItems() {
  document.querySelectorAll('.cp-item').forEach((el, i) => {
    el.classList.toggle('active', i === _activeIdx);
  });
  const active = document.querySelector('.cp-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

window.selectResult = function(idx) {
  const r = _results[idx];
  if (!r) return;
  closePalette();
  r.action();
};

window.closePalette = function() {
  if (!_palettEl) return;
  _open = false;
  _palettEl.style.display = 'none';
  _palettEl.innerHTML = '';
};
