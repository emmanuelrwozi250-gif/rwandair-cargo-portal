// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence Portal — Network Map
// ═══════════════════════════════════════════════════════════════════

import { STATIONS, getStation } from '../data/stations.js';
import { ROUTES } from '../data/flights.js';
import { formatNumber, esc } from '../utils/format.js';
import { showToast } from '../components/toast.js';

// Station coordinate overrides (lat, lon) — real IATA coords
const COORDS = {
  KGL:[-1.9706, 30.1395], LHR:[51.4775,-0.4614], CDG:[49.0097,2.5479],
  BRU:[50.9014,4.4844],   AMS:[52.3086,4.7639],  DXB:[25.2532,55.3657],
  DWC:[24.8966,55.1619],  DOH:[25.2598,51.6138],  SHJ:[25.3286,55.5172],
  LOS:[6.5774,3.3212],    ACC:[5.6052,-0.1668],   DLA:[4.0061,9.7195],
  LBV:[-0.4586,9.4123],   BGF:[4.3985,18.5188],   JNB:[-26.1392,28.2460],
  CPT:[-33.9649,18.6022], LUN:[-15.3308,28.4526],  HRE:[-17.9318,31.0928],
  NBO:[-1.3192,36.9275],  EBB:[0.0424,32.4433],   DAR:[-6.8781,39.2026],
  JRO:[-3.4295,37.0693],  ZNZ:[-6.2220,39.2248],  MBA:[-4.0348,39.5942],
  BJM:[-3.3240,29.3188],  KME:[-2.4625,29.9786],  ADD:[8.9779,38.7993],
};

// Route connections (only major routes)
const ROUTE_LINES = [
  { from:'KGL', to:'LHR', type:'widebody', freq:'Daily' },
  { from:'KGL', to:'CDG', type:'widebody', freq:'3×wk' },
  { from:'KGL', to:'BRU', type:'widebody', freq:'3×wk' },
  { from:'KGL', to:'DXB', type:'narrowbody', freq:'Daily' },
  { from:'KGL', to:'DOH', type:'narrowbody', freq:'Daily' },
  { from:'KGL', to:'LOS', type:'widebody', freq:'Daily' },
  { from:'KGL', to:'ACC', type:'narrowbody', freq:'3×wk' },
  { from:'KGL', to:'DLA', type:'narrowbody', freq:'2×wk' },
  { from:'KGL', to:'JNB', type:'narrowbody', freq:'Daily' },
  { from:'KGL', to:'NBO', type:'turboprop', freq:'Daily×2' },
  { from:'KGL', to:'EBB', type:'narrowbody', freq:'Daily×2' },
  { from:'KGL', to:'DAR', type:'narrowbody', freq:'3×wk' },
  { from:'KGL', to:'ADD', type:'narrowbody', freq:'Daily' },
  { from:'KGL', to:'ZNZ', type:'narrowbody', freq:'4×wk' },
  { from:'DWC', to:'KGL', type:'freighter', freq:'Daily' },
  { from:'DWC', to:'LOS', type:'freighter', freq:'3×wk' },
  { from:'DWC', to:'EBB', type:'freighter', freq:'3×wk' },
  { from:'NBO', to:'LHR', type:'widebody', freq:'Daily' },
];

function markerColor(station) {
  if (station.code === 'KGL') return '#FEE014';
  if (['LHR','CDG','AMS','BRU'].includes(station.code)) return '#00529B';
  if (['DXB','DWC','DOH','SHJ'].includes(station.code)) return '#C0392B';
  return '#1EA2DC';
}

function lineColor(type) {
  if (type === 'freighter')   return '#C0392B';
  if (type === 'widebody')    return '#00529B';
  if (type === 'narrowbody')  return '#1EA2DC';
  return '#94C943';
}

export function render() {
  const totalStations = STATIONS.length;
  const alertStations = STATIONS.filter(s => s.dwellAlerts > 0).length;

  return `
  <div class="page" style="height:100%;display:flex;flex-direction:column">
    <div class="page-header">
      <div>
        <h1 class="page-title">🗺️ Network Map</h1>
        <p class="page-sub">${totalStations} stations · ${ROUTE_LINES.length} routes · RwandAir global cargo network</p>
      </div>
      <div class="page-actions">
        <div style="display:flex;align-items:center;gap:12px;font-size:12px">
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FEE014;margin-right:4px"></span>Hub (KGL)</span>
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#00529B;margin-right:4px"></span>Europe</span>
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#C0392B;margin-right:4px"></span>ME/Freighter</span>
          <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#1EA2DC;margin-right:4px"></span>Africa</span>
        </div>
        <button class="btn btn-sec" onclick="networkResetView()">⊕ Reset View</button>
      </div>
    </div>

    ${alertStations > 0 ? `
    <div style="background:var(--gold-lt);border:1px solid var(--gold2);border-radius:var(--radius-sm);padding:8px 14px;margin-bottom:12px;font-size:13px">
      ⚠️ <strong>${alertStations} station${alertStations>1?'s':''} with dwell alerts</strong> — click marker for details
    </div>` : ''}

    <!-- Map container -->
    <div class="card" style="flex:1;min-height:500px;overflow:hidden;padding:0">
      <div id="network-map" style="width:100%;height:100%;min-height:500px;border-radius:var(--radius-md)"></div>
    </div>

    <!-- Station summary strip -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:16px">
      ${STATIONS.slice(0,8).map(s => `
        <div class="card" style="padding:12px;cursor:pointer" onclick="networkFlyTo('${s.code}')">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px;width:32px;height:32px;background:${markerColor(s)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:${s.code==='KGL'?'#00529B':'#fff'};font-size:12px">${s.code}</span>
            <div>
              <div style="font-weight:600;font-size:13px">${esc(s.city)}</div>
              <div style="font-size:11px;color:var(--mid)">${s.dwellAlerts||0} alerts</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>`;
}

export function init(container) {
  if (!window.L) {
    container.querySelector('#network-map').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--mid)">Leaflet.js not loaded — check CDN connection</div>';
    return;
  }

  const map = window.L.map('network-map', {
    center: [5, 20],
    zoom: 3,
    zoomControl: true,
    attributionControl: false,
  });

  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Draw route lines
  ROUTE_LINES.forEach(route => {
    const from = COORDS[route.from];
    const to   = COORDS[route.to];
    if (!from || !to) return;

    window.L.polyline([from, to], {
      color: lineColor(route.type),
      weight: route.type === 'freighter' ? 2.5 : route.type === 'widebody' ? 2 : 1.5,
      opacity: route.type === 'freighter' ? 0.9 : 0.6,
      dashArray: route.type === 'freighter' ? '8,4' : null,
    }).bindTooltip(`${route.from}↔${route.to} · ${route.freq}`, { sticky:true }).addTo(map);
  });

  // Draw station markers
  STATIONS.forEach(s => {
    const coord = COORDS[s.code];
    if (!coord) return;

    const isHub   = s.code === 'KGL';
    const hasAlert = (s.dwellAlerts || 0) > 0;
    const size    = isHub ? 18 : 12;
    const color   = markerColor(s);

    const icon = window.L.divIcon({
      className: '',
      html: `<div style="
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:2px solid ${isHub?'#00529B':'rgba(255,255,255,0.8)'};
        ${hasAlert ? 'box-shadow:0 0 0 3px rgba(192,57,43,0.4)' : 'box-shadow:0 2px 6px rgba(0,0,0,0.3)'};
        display:flex;align-items:center;justify-content:center;
        font-size:${isHub?'7':'6'}px;font-weight:700;color:${isHub?'#00529B':'#fff'};
      ">${isHub?'KGL':''}</div>`,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });

    const popup = window.L.popup({ maxWidth:220 }).setContent(`
      <div style="font-family:Inter,sans-serif;font-size:13px">
        <div style="font-weight:700;font-size:14px;color:#00529B;margin-bottom:4px">${s.code} — ${s.city}</div>
        <div style="color:#6B7A99;margin-bottom:8px">${s.country} · ${s.region}</div>
        ${s.dwellAlerts > 0 ? `<div style="color:#C0392B;font-weight:600;margin-bottom:6px">⚠ ${s.dwellAlerts} dwell alert(s)</div>` : ''}
        <div>Revenue target: <strong>$${(s.revTarget/1000).toFixed(0)}K/mo</strong></div>
        ${s.gsaName ? `<div>GSA: ${s.gsaName}</div>` : ''}
      </div>
    `);

    window.L.marker(coord, { icon }).bindPopup(popup).addTo(map);
  });

  // Global handlers
  window.networkResetView = () => map.setView([5, 20], 3);
  window.networkFlyTo = (code) => {
    const coord = COORDS[code];
    if (coord) map.setView(coord, 6);
  };
}

export const handler = { render, init };
