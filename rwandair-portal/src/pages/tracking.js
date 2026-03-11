// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Shipment Tracking Page
// AWB search, 6 trackable AWBs, dwell times with RAG, timeline, share
// ═══════════════════════════════════════════════════════════════════

import { AWB_DATA, TRACKABLE_AWBS } from '../data/awbs.js';
import { formatDate, formatDwell, ragClass, esc, debounce } from '../utils/format.js';
import { showToast } from '../components/toast.js';
import { icon } from '../utils/icons.js';

const STATUS_STEPS = ['Booked','Accepted','ULD Build-up','Uplifted','In Transit','Connecting','Customs Clearance','Out for Delivery','Delivered'];

export function render() {
  return `
  <div class="page-wrap">

    <!-- Portal header bar -->
    <div class="portal-header-bar">
      <div class="portal-header-left">
        <span class="portal-header-icon">${icon('map-pin', 18)}</span>
        <div>
          <div class="portal-header-title">Track Shipment</div>
          <div class="portal-header-sub">Real-time AWB tracking with timeline and dwell monitoring · ${formatDate(new Date(),'short')}</div>
        </div>
      </div>
      <div class="portal-header-right">
        <span style="font-size:11px;color:rgba(255,255,255,0.55)">${icon('activity',12)} Live tracking enabled</span>
      </div>
    </div>

  <!-- Search -->
  <div class="card track-search-card">
    <form id="track-form" onsubmit="trackSearch(event)">
      <div class="track-input-row">
        <input type="text" class="form-control track-input" id="track-input"
               placeholder="Enter AWB number e.g. WB-11223344 or 459-66271704"
               autocomplete="off">
        <button type="submit" class="btn btn-pri btn-lg">Track</button>
      </div>
    </form>
    <div class="track-quick-links">
      <span class="text-mid text-sm">Quick track:</span>
      ${TRACKABLE_AWBS.slice(0,6).map(a => `
        <button class="btn btn-link text-sm" onclick="quickTrack('${a}')">${a}</button>
      `).join('')}
    </div>
  </div>

  <!-- Result -->
  <div id="track-result"></div>
  </div>`;
}

export function init() {
  // Listen for pre-fill from command palette
  const inp = document.getElementById('track-input');
  if (inp) {
    inp.addEventListener('keyup', debounce(e => {
      const v = e.target.value.trim();
      if (v.length >= 8) _tryAutoTrack(v);
    }, 800));
  }
}

function _tryAutoTrack(val) {
  const match = AWB_DATA.find(a => a.awb.toLowerCase() === val.toLowerCase() ||
    a.awb.replace('WB-','').toLowerCase() === val.toLowerCase());
  if (match) _showResult(match);
}

window.quickTrack = function(awb) {
  const inp = document.getElementById('track-input');
  if (inp) { inp.value = awb; }
  const match = AWB_DATA.find(a => a.awb === awb);
  if (match) _showResult(match);
};

window.trackSearch = function(e) {
  e.preventDefault();
  const val = document.getElementById('track-input')?.value?.trim();
  if (!val) {
    showToast('Please enter an AWB number', 'warning');
    return;
  }

  const resultEl = document.getElementById('track-result');
  resultEl.innerHTML = `<div class="skeleton-wrap">${Array(4).fill('<div class="skeleton skeleton-row"></div>').join('')}</div>`;

  setTimeout(() => {
    const match = AWB_DATA.find(a =>
      a.awb.toLowerCase().includes(val.toLowerCase()) ||
      val.toLowerCase().includes(a.awb.replace('WB-','').toLowerCase())
    );
    if (match) _showResult(match);
    else {
      resultEl.innerHTML = `<div class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-title">AWB not found</div>
        <div class="empty-sub">${esc(val)} — not in the system. Try one of the quick-track links above.</div>
      </div>`;
    }
  }, 400);
};

function _showResult(awb) {
  const resultEl = document.getElementById('track-result');
  if (!resultEl) return;

  const currentStepIdx = STATUS_STEPS.indexOf(awb.status);
  const lastEvent = awb.timeline[awb.timeline.length - 1];
  const firstTime = new Date(awb.timeline[0]?.time);
  const lastTime = new Date(lastEvent?.time);
  const dwellMin = Math.floor((Date.now() - lastTime.getTime()) / 60000);

  const statusColors = {
    'Delivered': 'var(--green)', 'In Transit': 'var(--navy)',
    'Customs Clearance': 'var(--amber)', 'Booked': 'var(--mid)',
    'On Hold': 'var(--red)', 'Connecting': 'var(--teal)'
  };
  const statusColor = statusColors[awb.status] || 'var(--navy)';

  resultEl.innerHTML = `
  <div class="track-result-grid">

    <!-- Main card -->
    <div class="card track-main-card">
      <div class="track-header">
        <div class="track-awb-row">
          <div class="track-awb-number mono">${esc(awb.awb)}</div>
          <span class="badge" style="background:${statusColor}20;color:${statusColor};font-size:14px">${esc(awb.status)}</span>
        </div>
        <div class="track-route">${esc(awb.origin)} → ${esc(awb.destination)}</div>
        <div class="track-meta">
          <span>${esc(awb.shipper)} → ${esc(awb.consignee)}</span>
          <span>${awb.weight} kg · ${esc(awb.commodity)}</span>
          ${awb.specialHandling ? `<span class="badge-small">${awb.specialHandling}</span>` : ''}
        </div>
      </div>

      <!-- Progress stepper -->
      <div class="track-stepper">
        ${STATUS_STEPS.map((step, i) => {
          const done = i <= currentStepIdx;
          const active = i === currentStepIdx;
          return `
          <div class="stepper-step ${done ? 'done' : ''} ${active ? 'active' : ''}">
            <div class="stepper-dot">${done ? '✓' : i+1}</div>
            <div class="stepper-label">${step}</div>
          </div>
          ${i < STATUS_STEPS.length - 1 ? `<div class="stepper-line ${i < currentStepIdx ? 'done' : ''}"></div>` : ''}`;
        }).join('')}
      </div>

      <!-- Current dwell -->
      ${awb.status !== 'Delivered' ? `
      <div class="dwell-banner">
        <span>Current dwell at ${esc(lastEvent?.location || '—')}</span>
        ${formatDwell(dwellMin)}
      </div>` : ''}
    </div>

    <!-- Route map SVG -->
    <div class="card track-map-card">
      <div class="card-label">Route</div>
      ${_renderRouteMap(awb)}
    </div>

    <!-- Timeline -->
    <div class="card track-timeline-card">
      <div class="card-label">Event Timeline</div>
      <div class="timeline">
        ${awb.timeline.map((ev, i) => `
          <div class="timeline-item">
            <div class="timeline-dot ${i === awb.timeline.length - 1 ? 'active' : ''}"></div>
            <div class="timeline-content">
              <div class="timeline-stage">${esc(ev.stage)}</div>
              <div class="timeline-location">${esc(ev.location)} · ${esc(ev.handler)}</div>
              <div class="timeline-note text-sm">${esc(ev.note)}</div>
              <div class="timeline-time text-mid text-sm">${formatDate(ev.time, 'datetime')}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Charge summary -->
    <div class="card track-charges-card">
      <div class="card-label">Shipment Details</div>
      <div class="detail-grid compact">
        <div class="detail-row"><span>AWB</span><span class="mono">${esc(awb.awb)}</span></div>
        <div class="detail-row"><span>Flight</span><span class="mono">${esc(awb.flight)}</span></div>
        <div class="detail-row"><span>Weight</span><span>${awb.weight} kg</span></div>
        <div class="detail-row"><span>Volume</span><span>${awb.volume} CBM</span></div>
        <div class="detail-row"><span>Rate</span><span>$${awb.rate}/kg</span></div>
        <div class="detail-row"><span>Total Charge</span><strong>$${awb.totalCharge.toFixed(2)}</strong></div>
        ${awb.specialHandling ? `<div class="detail-row"><span>SHC</span><span class="badge-small">${awb.specialHandling}</span></div>` : ''}
        <div class="detail-row"><span>Booked</span><span>${formatDate(awb.bookedDate,'short')}</span></div>
      </div>
      <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sec btn-sm" onclick="shareTrackLink('${awb.awb}')">Share Link</button>
        <button class="btn btn-sec btn-sm" onclick="showToast('Print function ready','info','PDF would open','2500')">Print</button>
        <button class="btn btn-sec btn-sm" onclick="showToast('Notification subscribed','success','You will be alerted on status changes','3000')">Subscribe</button>
      </div>
    </div>
  </div>`;
}

function _renderRouteMap(awb) {
  // Simplified SVG route visualization
  const stopsSet = new Set();
  awb.timeline.forEach(e => stopsSet.add(e.location));
  const stops = [...stopsSet].filter(s => s.length <= 4);
  const n = stops.length;
  const w = 320, h = 80;
  const step = n > 1 ? w / (n - 1) : w / 2;

  const dots = stops.map((s, i) => {
    const x = n > 1 ? i * step : w / 2;
    const isActive = s === (awb.timeline[awb.timeline.length - 1]?.location);
    return `
      <circle cx="${x}" cy="40" r="${isActive ? 8 : 5}"
              fill="${isActive ? 'var(--navy)' : 'var(--teal)'}" />
      <text x="${x}" y="62" text-anchor="middle" font-size="10" fill="var(--dark)" font-family="Inter">${s}</text>
    `;
  }).join('');

  const lines = stops.slice(1).map((_, i) => {
    const x1 = i * step, x2 = (i+1) * step;
    return `<line x1="${x1}" y1="40" x2="${x2}" y2="40" stroke="var(--teal)" stroke-width="2" stroke-dasharray="4,3"/>`;
  }).join('');

  return `<svg viewBox="0 0 ${w} ${h+20}" width="100%" style="overflow:visible;max-height:90px">
    ${lines}${dots}
  </svg>`;
}

window.shareTrackLink = function(awb) {
  const url = `${window.location.origin}${window.location.pathname}#tracking?awb=${encodeURIComponent(awb)}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard', 'success', awb, 3000));
  } else {
    showToast('Tracking link: ' + url, 'info');
  }
};

export const handler = { render, init };
