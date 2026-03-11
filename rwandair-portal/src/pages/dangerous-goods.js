// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Dangerous Goods Page
// DG shipments table, IATA class colour coding, acceptance checklist
// ═══════════════════════════════════════════════════════════════════

import { formatDate, esc } from '../utils/format.js';
import { showToast } from '../components/toast.js';

const DG_CLASSES = {
  '1': { label:'Explosives', color:'#FF6B6B', bg:'#FF6B6B20' },
  '2.1': { label:'Flammable Gas', color:'#FF8C00', bg:'#FF8C0020' },
  '2.2': { label:'Non-Toxic Gas', color:'#4CAF50', bg:'#4CAF5020' },
  '2.3': { label:'Toxic Gas', color:'#9C27B0', bg:'#9C27B020' },
  '3': { label:'Flammable Liquid', color:'#F44336', bg:'#F4433620' },
  '4.1': { label:'Flammable Solid', color:'#E91E63', bg:'#E91E6320' },
  '6.1': { label:'Toxic', color:'#673AB7', bg:'#673AB720' },
  '6.2': { label:'Infectious', color:'#9C27B0', bg:'#9C27B020' },
  '7': { label:'Radioactive', color:'#FFEB3B', bg:'#FFEB3B30' },
  '8': { label:'Corrosive', color:'#FF5722', bg:'#FF572220' },
  '9': { label:'Misc Dangerous', color:'#607D8B', bg:'#607D8B20' },
};

const DG_SHIPMENTS = [
  { awb:'459-64792880', origin:'KGL', dest:'LHR', class:'2.2', un:'UN1066', name:'Nitrogen, compressed', weight:95, pieces:2, flight:'WB710', status:'NOTOC Pending', acceptor:'R. Nkurunziza', checked:false, pax:true },
  { awb:'459-64668321', origin:'ADD', dest:'KGL', class:'3', un:'UN1203', name:'Gasoline', weight:185, pieces:3, flight:'WB701', status:'Accepted', acceptor:'J. Kamau', checked:true, pax:true },
  { awb:'459-64801188', origin:'NBO', dest:'DXB', class:'6.2', un:'UN3373', name:'Biological substance B', weight:12, pieces:1, flight:'WB622', status:'Under Review', acceptor:'F. Osei', checked:false, pax:true },
  { awb:'459-64815720', origin:'KGL', dest:'LHR', class:'9', un:'UN3090', name:'Lithium metal batteries', weight:280, pieces:8, flight:'WB710', status:'Accepted', acceptor:'R. Nkurunziza', checked:true, pax:true },
  { awb:'459-64822901', origin:'LOS', dest:'KGL', class:'8', un:'UN1760', name:'Corrosive liquid, N.O.S.', weight:46, pieces:2, flight:'WB107', status:'CAO Only', acceptor:'J. Kamau', checked:false, pax:false },
  { awb:'459-64788544', origin:'DWC', dest:'EBB', class:'4.1', un:'UN1325', name:'Flammable solid, organic', weight:130, pieces:4, flight:'WB9317', status:'Accepted', acceptor:'A. Ndayishimiye', checked:true, pax:false },
  { awb:'459-64809901', origin:'KGL', dest:'CDG', class:'7', un:'UN2910', name:'Radioactive material (low activity)', weight:8, pieces:1, flight:'WB700', status:'Conditional', acceptor:'F. Osei', checked:false, pax:true },
];

const ACCEPTANCE_CHECKLIST = [
  'SDS / MSDS reviewed',
  'IATA DGR compliance confirmed',
  'Packaging integrity checked',
  'Labels/markings verified',
  'Quantity limits verified (PAX/CAO)',
  'Shipper declaration received',
  'NOTOC prepared',
  'Captain/crew briefed',
];

const DG_INCIDENTS = [
  { ref:'INC-2026-001', date:'2026-03-08', flight:'WB204', awb:'459-64668205', class:'3', description:'Mild fuel odour detected in ULD. Shipment removed from flight. Incident filed.', status:'Closed' },
  { ref:'INC-2026-002', date:'2026-03-05', flight:'WB9316', awb:'459-64801023', class:'9', description:'Lithium battery device auto-ignited in cargo hold. Flight diverted. Full investigation.', status:'Open' },
];

let _expandedChecklists = new Set();

export function render() {
  const pending = DG_SHIPMENTS.filter(d => d.status === 'NOTOC Pending' || d.status === 'Under Review').length;
  const accepted = DG_SHIPMENTS.filter(d => d.status === 'Accepted').length;

  return `
  <div class="page-header">
    <div>
      <h1 class="page-title">Dangerous Goods</h1>
      <p class="page-sub">IATA DGR compliance — ${DG_SHIPMENTS.length} DG shipments active</p>
    </div>
    <div class="page-actions">
      <button class="btn btn-sec" onclick="showDGMatrix()">DG Class Matrix</button>
      <button class="btn btn-pri" onclick="showToast('DG report exported','success','IATA DGR compliance report PDF','3000')">Export Report</button>
    </div>
  </div>

  <div class="kpi-row">
    <div class="kpi-card kpi-danger"><div class="kpi-value">${pending}</div><div class="kpi-label">Pending Acceptance</div></div>
    <div class="kpi-card kpi-ok"><div class="kpi-value">${accepted}</div><div class="kpi-label">Accepted</div></div>
    <div class="kpi-card"><div class="kpi-value">${DG_SHIPMENTS.filter(d=>!d.pax).length}</div><div class="kpi-label">CAO Only</div></div>
    <div class="kpi-card kpi-warning"><div class="kpi-value">${DG_INCIDENTS.filter(i=>i.status==='Open').length}</div><div class="kpi-label">Open Incidents</div></div>
  </div>

  <!-- DG Shipments -->
  <div class="card">
    <h3 class="card-title">Active DG Shipments</h3>
    <table class="data-table">
      <thead>
        <tr><th></th><th>AWB</th><th>Class</th><th>UN No.</th><th>Description</th><th>Weight</th>
          <th>Flight</th><th>PAX/CAO</th><th>Status</th><th>Acceptor</th><th></th>
        </tr>
      </thead>
      <tbody>
        ${DG_SHIPMENTS.map(d => {
          const cls = DG_CLASSES[d.class] || { color:'var(--mid)', bg:'var(--smoke)', label:'Unknown' };
          const statusColors = { 'Accepted':'var(--green)', 'NOTOC Pending':'var(--red)', 'Under Review':'var(--amber)', 'CAO Only':'var(--amber)', 'Conditional':'var(--amber)' };
          const sc = statusColors[d.status] || 'var(--mid)';
          const expanded = _expandedChecklists.has(d.awb);
          return `
          <tr class="table-row" onclick="toggleDGChecklist('${d.awb}')">
            <td><button class="expand-btn">${expanded ? '▼' : '▶'}</button></td>
            <td class="mono text-sm">${esc(d.awb)}</td>
            <td>
              <span class="dg-class-badge" style="background:${cls.bg};color:${cls.color};border:1px solid ${cls.color}">
                Class ${d.class}
              </span>
            </td>
            <td class="mono text-sm">${esc(d.un)}</td>
            <td class="text-sm">${esc(d.name)}</td>
            <td>${d.weight} kg / ${d.pieces}pc</td>
            <td class="mono text-sm">${esc(d.flight)}</td>
            <td>
              <span class="badge-small ${d.pax ? '' : ''}" style="background:${d.pax?'var(--green)20':'var(--amber)20'};color:${d.pax?'var(--green)':'var(--amber)'}">
                ${d.pax ? 'PAX OK' : 'CAO'}
              </span>
            </td>
            <td><span class="badge" style="background:${sc}20;color:${sc}">${esc(d.status)}</span></td>
            <td class="text-sm">${esc(d.acceptor)}</td>
            <td onclick="event.stopPropagation()">
              <button class="btn btn-sec btn-sm" onclick="showToast('NOTOC printed','info','NOTOC for ${esc(d.awb)} sent to captain','3000')">NOTOC</button>
            </td>
          </tr>
          ${expanded ? `
          <tr class="expand-row">
            <td colspan="11">
              <div class="expand-content">
                <h4 style="margin:0 0 12px">Acceptance Checklist — ${d.awb}</h4>
                <div class="dg-checklist-grid">
                  ${ACCEPTANCE_CHECKLIST.map((item, i) => `
                    <div class="checklist-item">
                      <input type="checkbox" id="dgcl-${i}-${d.awb.replace(/[^a-z0-9]/gi,'')}"
                             ${d.checked ? 'checked' : ''}
                             onchange="showToast('Checklist updated','info')">
                      <label for="dgcl-${i}-${d.awb.replace(/[^a-z0-9]/gi,'')}">${item}</label>
                    </div>
                  `).join('')}
                </div>
                <div class="expand-actions" style="margin-top:12px">
                  <button class="btn btn-pri btn-sm" onclick="acceptDG('${esc(d.awb)}')">Accept Shipment</button>
                  <button class="btn btn-danger btn-sm" onclick="rejectDG('${esc(d.awb)}')">Reject / Hold</button>
                  <button class="btn btn-sec btn-sm" onclick="showToast('DGR form opened','info','IATA DGR acceptance form loaded','2500')">Print DGR Form</button>
                </div>
              </div>
            </td>
          </tr>` : ''}`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <!-- Incidents -->
  <div class="card" style="margin-top:16px">
    <div class="card-header-row">
      <h3>DG Incidents</h3>
      <button class="btn btn-sec btn-sm" onclick="showToast('Incident form opened','info')">Report Incident</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Ref</th><th>Date</th><th>Flight</th><th>AWB</th><th>Class</th><th>Description</th><th>Status</th></tr></thead>
      <tbody>
        ${DG_INCIDENTS.map(inc => {
          const sc = inc.status === 'Open' ? 'var(--red)' : 'var(--green)';
          return `<tr>
            <td class="mono text-sm">${esc(inc.ref)}</td>
            <td>${formatDate(inc.date,'short')}</td>
            <td class="mono">${esc(inc.flight)}</td>
            <td class="mono text-sm">${esc(inc.awb)}</td>
            <td>Class ${inc.class}</td>
            <td class="text-sm">${esc(inc.description)}</td>
            <td><span class="badge" style="background:${sc}20;color:${sc}">${inc.status}</span></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  `;
}

export function init() {}

window.toggleDGChecklist = function(awb) {
  if (_expandedChecklists.has(awb)) _expandedChecklists.delete(awb);
  else _expandedChecklists.add(awb);
  import('./dangerous-goods.js').then(m => {
    const main = document.getElementById('main-content');
    if (main) { main.innerHTML = m.render(); setTimeout(() => m.init(main), 10); }
  });
};

window.acceptDG = function(awb) {
  const item = DG_SHIPMENTS.find(d => d.awb === awb);
  if (item) { item.status = 'Accepted'; item.checked = true; }
  showToast('DG Shipment Accepted', 'success', `${awb} — NOTOC prepared and captain briefed`, 4000);
};

window.rejectDG = function(awb) {
  const item = DG_SHIPMENTS.find(d => d.awb === awb);
  if (item) item.status = 'Rejected';
  showToast('Shipment rejected', 'error', `${awb} — shipper notified, cargo held`, 5000);
};

window.showDGMatrix = function() {
  import('../components/modals.js').then(m => {
    m.openModal('IATA DG Class Matrix',
      `<table class="data-table">
        <thead><tr><th>Class</th><th>Description</th><th>PAX Aircraft</th><th>Cargo Aircraft</th></tr></thead>
        <tbody>${Object.entries(DG_CLASSES).map(([c, info]) => `
          <tr>
            <td><span class="dg-class-badge" style="background:${info.bg};color:${info.color}">Class ${c}</span></td>
            <td>${info.label}</td>
            <td style="text-align:center">${['1','2.3','6.2','7'].includes(c) ? '❌' : '✓'}</td>
            <td style="text-align:center">✓</td>
          </tr>
        `).join('')}</tbody>
      </table>`,
      '<button class="btn btn-pri" onclick="closeModal()">Close</button>'
    );
  });
};

export const handler = { render, init };
