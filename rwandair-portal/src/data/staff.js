// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Staff Roster & Assignments
// Staff members responsible for flights and shipment handling
// ═══════════════════════════════════════════════════════════════════

export const STAFF_ROSTER = [
  // ── KGL Hub ─────────────────────────────────────────────────────
  { id:'STF-001', name:'James Kamau',       initials:'JK', role:'Lead Handler',  station:'KGL',
    phone:'+250 788 123 001', email:'j.kamau@rwandair.com',    shift:'Day',
    certifications:['DG','PIL','COL','VAL'], active:true },
  { id:'STF-002', name:'Aline Ndayishimiye',initials:'AN', role:'Supervisor',    station:'KGL',
    phone:'+250 788 123 002', email:'a.ndayishimiye@rwandair.com', shift:'Day',
    certifications:['DG','PIL','COL','VAL','QA'], active:true },
  { id:'STF-003', name:'Patrick Habimana',  initials:'PH', role:'Lead Handler',  station:'KGL',
    phone:'+250 788 123 003', email:'p.habimana@rwandair.com', shift:'Night',
    certifications:['DG','COL'], active:true },
  { id:'STF-004', name:'Grace Uwimana',     initials:'GU', role:'Supervisor',    station:'KGL',
    phone:'+250 788 123 004', email:'g.uwimana@rwandair.com',  shift:'Night',
    certifications:['DG','PIL','VAL','QA'], active:true },
  { id:'STF-005', name:'Jean-Claude Nziza', initials:'JN', role:'Lead Handler',  station:'KGL',
    phone:'+250 788 123 005', email:'jc.nziza@rwandair.com',   shift:'Rotating',
    certifications:['COL','PIL'], active:true },

  // ── NBO Transit Hub ─────────────────────────────────────────────
  { id:'STF-006', name:'Mary Wanjiru',      initials:'MW', role:'Lead Handler',  station:'NBO',
    phone:'+254 722 456 001', email:'m.wanjiru@rwandair.com',  shift:'Day',
    certifications:['DG','COL','PIL'], active:true },
  { id:'STF-007', name:'David Ochieng',     initials:'DO', role:'Supervisor',    station:'NBO',
    phone:'+254 722 456 002', email:'d.ochieng@rwandair.com',  shift:'Day',
    certifications:['DG','PIL','COL','VAL','QA'], active:true },
  { id:'STF-008', name:'Sarah Muthoni',     initials:'SM', role:'Lead Handler',  station:'NBO',
    phone:'+254 722 456 003', email:'s.muthoni@rwandair.com',  shift:'Night',
    certifications:['DG','COL'], active:true },

  // ── DXB Gateway ─────────────────────────────────────────────────
  { id:'STF-009', name:'Fatima Osei',       initials:'FO', role:'Lead Handler',  station:'DXB',
    phone:'+971 50 789 001',  email:'f.osei@rwandair.com',     shift:'Day',
    certifications:['DG','PIL','COL','VAL'], active:true },
  { id:'STF-010', name:'Ahmed Al Rashid',   initials:'AR', role:'Supervisor',    station:'DXB',
    phone:'+971 50 789 002',  email:'a.alrashid@rwandair.com', shift:'Day',
    certifications:['DG','PIL','VAL','QA'], active:true },

  // ── Other stations ──────────────────────────────────────────────
  { id:'STF-011', name:'Samuel Okonkwo',    initials:'SO', role:'Lead Handler',  station:'LOS',
    phone:'+234 803 100 001', email:'s.okonkwo@rwandair.com',  shift:'Day',
    certifications:['DG','COL'], active:true },
  { id:'STF-012', name:'Emmanuel Ssempala', initials:'ES', role:'Lead Handler',  station:'EBB',
    phone:'+256 772 200 001', email:'e.ssempala@rwandair.com', shift:'Day',
    certifications:['DG','PIL'], active:true },
  { id:'STF-013', name:'Amina Dembélé',    initials:'AD', role:'Supervisor',    station:'ADD',
    phone:'+251 911 300 001', email:'a.dembele@rwandair.com',  shift:'Day',
    certifications:['DG','PIL','COL','QA'], active:true },
  { id:'STF-014', name:'Joseph Habiyaremye',initials:'JH', role:'Lead Handler',  station:'JNB',
    phone:'+27 83 400 001',   email:'j.habiyaremye@rwandair.com', shift:'Day',
    certifications:['DG','COL','VAL'], active:true },
  { id:'STF-015', name:'Claudine Mukeshimana',initials:'CM',role:'Supervisor',   station:'LHR',
    phone:'+44 7700 500 001', email:'c.mukeshimana@rwandair.com', shift:'Day',
    certifications:['DG','PIL','COL','VAL','QA'], active:true },
];

// ── Flight → Staff Assignments ────────────────────────────────────
// Maps each flight on a given date to lead handler + supervisor
export const FLIGHT_STAFF = [
  // Inbound flights (arriving KGL)
  { flight:'WB711', date:'2026-03-11', leadHandler:'STF-001', supervisor:'STF-002' },
  { flight:'WB701', date:'2026-03-11', leadHandler:'STF-003', supervisor:'STF-004' },
  { flight:'WB201', date:'2026-03-11', leadHandler:'STF-005', supervisor:'STF-002' },
  { flight:'WB9317',date:'2026-03-11', leadHandler:'STF-001', supervisor:'STF-004' },
  { flight:'WB305', date:'2026-03-11', leadHandler:'STF-005', supervisor:'STF-002' },
  { flight:'WB107', date:'2026-03-11', leadHandler:'STF-006', supervisor:'STF-007' },

  // Outbound flights (departing KGL)
  { flight:'WB710', date:'2026-03-12', leadHandler:'STF-001', supervisor:'STF-002' },
  { flight:'WB700', date:'2026-03-12', leadHandler:'STF-003', supervisor:'STF-004' },
  { flight:'WB622', date:'2026-03-12', leadHandler:'STF-005', supervisor:'STF-002' },
  { flight:'WB202', date:'2026-03-12', leadHandler:'STF-001', supervisor:'STF-004' },
  { flight:'WB9316',date:'2026-03-12', leadHandler:'STF-005', supervisor:'STF-002' },
  { flight:'WB304', date:'2026-03-12', leadHandler:'STF-003', supervisor:'STF-004' },
];

// ── AWB → Staff Assignments ───────────────────────────────────────
// Maps each shipment AWB to the handler and supervisor who processed it
export const AWB_STAFF = [
  { awb:'459-11223344', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-22334455', leadHandler:'STF-006', supervisor:'STF-007' },
  { awb:'459-33445566', leadHandler:'STF-014', supervisor:'STF-004' },
  { awb:'459-44556677', leadHandler:'STF-009', supervisor:'STF-010' },
  { awb:'459-55667788', leadHandler:'STF-006', supervisor:'STF-007' },
  { awb:'459-66778899', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-77889900', leadHandler:'STF-011', supervisor:'STF-013' },
  { awb:'459-88990011', leadHandler:'STF-003', supervisor:'STF-004' },
  { awb:'459-99001122', leadHandler:'STF-005', supervisor:'STF-002' },
  { awb:'459-10111213', leadHandler:'STF-012', supervisor:'STF-004' },
  { awb:'459-11121314', leadHandler:'STF-009', supervisor:'STF-010' },
  { awb:'459-12131415', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-13141516', leadHandler:'STF-006', supervisor:'STF-007' },
  { awb:'459-14151617', leadHandler:'STF-003', supervisor:'STF-004' },
  { awb:'459-15161718', leadHandler:'STF-014', supervisor:'STF-015' },
  { awb:'459-16171819', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-17181920', leadHandler:'STF-005', supervisor:'STF-004' },
  { awb:'459-18192021', leadHandler:'STF-009', supervisor:'STF-010' },
  { awb:'459-19202122', leadHandler:'STF-011', supervisor:'STF-013' },
  { awb:'459-20212223', leadHandler:'STF-006', supervisor:'STF-007' },
  // Warehouse transit AWBs
  { awb:'459-64813401', leadHandler:'STF-006', supervisor:'STF-007' },
  { awb:'459-66271704', leadHandler:'STF-014', supervisor:'STF-004' },
  { awb:'459-78234102', leadHandler:'STF-009', supervisor:'STF-010' },
  { awb:'459-81034567', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-42378901', leadHandler:'STF-011', supervisor:'STF-013' },
  { awb:'459-90234567', leadHandler:'STF-012', supervisor:'STF-004' },
  { awb:'459-55432198', leadHandler:'STF-001', supervisor:'STF-002' },
  { awb:'459-38765432', leadHandler:'STF-009', supervisor:'STF-010' },
  { awb:'459-71234098', leadHandler:'STF-006', supervisor:'STF-007' },
  { awb:'459-29876543', leadHandler:'STF-003', supervisor:'STF-004' },
  { awb:'459-63245678', leadHandler:'STF-005', supervisor:'STF-002' },
  { awb:'459-47823190', leadHandler:'STF-001', supervisor:'STF-004' },
];

// ── Helper functions ──────────────────────────────────────────────

export function getStaffById(id) {
  return STAFF_ROSTER.find(s => s.id === id) || null;
}

export function getStaffByStation(station) {
  return STAFF_ROSTER.filter(s => s.station === station && s.active);
}

export function getLeadHandlers(station) {
  return STAFF_ROSTER.filter(s => s.role === 'Lead Handler' && (!station || s.station === station) && s.active);
}

export function getSupervisors(station) {
  return STAFF_ROSTER.filter(s => s.role === 'Supervisor' && (!station || s.station === station) && s.active);
}

export function getFlightStaff(flight) {
  const a = FLIGHT_STAFF.find(f => f.flight === flight);
  if (!a) return null;
  return { lead: getStaffById(a.leadHandler), supervisor: getStaffById(a.supervisor) };
}

export function getAwbStaff(awb) {
  const a = AWB_STAFF.find(s => s.awb === awb);
  if (!a) return null;
  return { lead: getStaffById(a.leadHandler), supervisor: getStaffById(a.supervisor) };
}

/** Render a small staff badge pair */
export function staffBadgesHtml(staff) {
  if (!staff) return '<span class="text-mid text-xs">Not assigned</span>';
  const lead = staff.lead;
  const supv = staff.supervisor;
  return `
    <span class="badge badge-navy" style="font-size:11px;gap:3px" title="Lead Handler: ${lead?.name || '—'}${lead?.certifications?.length ? ' [' + lead.certifications.join(',') + ']' : ''}">
      <span style="width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:9px">${lead?.initials || '?'}</span>
      Lead: ${lead?.name || 'Unassigned'}
    </span>
    <span class="badge badge-teal" style="font-size:11px;gap:3px" title="Supervisor: ${supv?.name || '—'}${supv?.certifications?.length ? ' [' + supv.certifications.join(',') + ']' : ''}">
      <span style="width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.2);display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:9px">${supv?.initials || '?'}</span>
      Supv: ${supv?.name || 'Unassigned'}
    </span>`;
}
