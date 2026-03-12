// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Warehouse Inventory Mock Data
// 22 inventory items across KGL and NBO stations
// ═══════════════════════════════════════════════════════════════════

export const INVENTORY_ITEMS = [
  // ── KGL Export ─────────────────────────────────────────────────
  { awb:'459-44556677', station:'KGL', direction:'Export', zone:'General',   bin:'KGL-Gen-A3-R2',  commodity:'Electronics',       weight:210,  pieces:8,  shc:'ELI', status:'Stored',          dwellMin:480,  handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB622', route:'KGL-DXB' },
  { awb:'459-66778899', station:'KGL', direction:'Export', zone:'Cool Room', bin:'KGL-Cool-B1-R4', commodity:'Fresh Flowers',      weight:640,  pieces:16, shc:'COL', status:'Ready for ULD',   dwellMin:320,  handler:'RwandAir Direct',       temp:'4.2°C', inboundFlight:null,      outboundFlight:'WB710', route:'KGL-LHR' },
  { awb:'459-88990011', station:'KGL', direction:'Export', zone:'DG Cage',   bin:'KGL-DG-C1-R1',  commodity:'Lithium Batteries',  weight:95,   pieces:2,  shc:'RFL', status:'Staged',          dwellMin:190,  handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB710', route:'KGL-LHR' },
  { awb:'459-99001122', station:'KGL', direction:'Export', zone:'General',   bin:'KGL-Gen-A5-R1',  commodity:'Coffee Beans',       weight:2400, pieces:40, shc:'GEN', status:'Stored',          dwellMin:1200, handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB204', route:'KGL-CDG' },
  { awb:'459-12131415', station:'KGL', direction:'Export', zone:'VAL Vault', bin:'KGL-VAL-V1-R1',  commodity:'Coltan Ore Samples', weight:35,   pieces:1,  shc:'VAL', status:'Pending Customs', dwellMin:2880, handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB622', route:'KGL-DXB' },
  { awb:'459-16171819', station:'KGL', direction:'Export', zone:'Cool Room', bin:'KGL-Cool-B2-R3', commodity:'Tea Samples',        weight:120,  pieces:6,  shc:'COL', status:'Stored',          dwellMin:540,  handler:'RwandAir Direct',       temp:'6.1°C', inboundFlight:null,      outboundFlight:'WB204', route:'KGL-CDG' },
  { awb:'459-17181920', station:'KGL', direction:'Export', zone:'General',   bin:'KGL-Gen-D2-R5',  commodity:'Garments',           weight:780,  pieces:22, shc:'GEN', status:'Ready for ULD',   dwellMin:150,  handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB710', route:'KGL-LHR' },
  { awb:'459-78234102', station:'KGL', direction:'Export', zone:'Bulk',      bin:'KGL-Bulk-E1-R1', commodity:'Mining Equipment',   weight:3200, pieces:4,  shc:'GEN', status:'Dwell Alert',     dwellMin:4800, handler:'RwandAir Direct',       temp:null,    inboundFlight:null,      outboundFlight:'WB312', route:'KGL-JNB' },

  // ── KGL Import ─────────────────────────────────────────────────
  { awb:'459-10111213', station:'KGL', direction:'Import', zone:'General',   bin:'KGL-Gen-A1-R3',  commodity:'Medical Supplies',   weight:310,  pieces:12, shc:'PIL', status:'Pending Customs', dwellMin:960,  handler:'Uganda Air Cargo',      temp:null,    inboundFlight:'WB701',   outboundFlight:null,    route:'EBB-KGL' },
  { awb:'459-81034567', station:'KGL', direction:'Import', zone:'Cool Room', bin:'KGL-Cool-B3-R2', commodity:'Pharmaceuticals',    weight:180,  pieces:5,  shc:'PIL', status:'Stored',          dwellMin:420,  handler:'AL RAIS CARGO',         temp:'5.5°C', inboundFlight:'WB9317',  outboundFlight:null,    route:'DXB-KGL' },
  { awb:'459-42378901', station:'KGL', direction:'Import', zone:'DG Cage',   bin:'KGL-DG-C2-R1',  commodity:'Lab Chemicals',      weight:65,   pieces:3,  shc:'RFL', status:'Pending Customs', dwellMin:1440, handler:'Horn of Africa Cargo',  temp:null,    inboundFlight:'WB516',   outboundFlight:null,    route:'ADD-KGL' },
  { awb:'459-90234567', station:'KGL', direction:'Import', zone:'General',   bin:'KGL-Gen-B4-R2',  commodity:'Textiles',           weight:450,  pieces:15, shc:'GEN', status:'Staged',          dwellMin:240,  handler:'Dar Freight',           temp:null,    inboundFlight:'WB305',   outboundFlight:null,    route:'DAR-KGL' },
  { awb:'459-55432198', station:'KGL', direction:'Import', zone:'VAL Vault', bin:'KGL-VAL-V2-R1',  commodity:'Diplomatic Pouch',   weight:8,    pieces:1,  shc:'VAL', status:'Stored',          dwellMin:30,   handler:'RwandAir Direct',       temp:null,    inboundFlight:'WB201',   outboundFlight:null,    route:'BRU-KGL' },

  // ── NBO Export ─────────────────────────────────────────────────
  { awb:'459-11223344', station:'NBO', direction:'Export', zone:'General',   bin:'NBO-Gen-F2-R4',  commodity:'General Cargo',      weight:340,  pieces:4,  shc:'GEN', status:'Stored',          dwellMin:720,  handler:'East Africa Cargo',     temp:null,    inboundFlight:null,      outboundFlight:'WB204', route:'NBO-LHR' },
  { awb:'459-22334455', station:'NBO', direction:'Export', zone:'Cool Room', bin:'NBO-Cool-G1-R2', commodity:'Fresh Produce',      weight:820,  pieces:18, shc:'COL', status:'Staged',          dwellMin:280,  handler:'East Africa Cargo',     temp:'3.8°C', inboundFlight:null,      outboundFlight:'WB204', route:'NBO-CDG' },
  { awb:'459-38765432', station:'NBO', direction:'Export', zone:'DG Cage',   bin:'NBO-DG-H1-R1',  commodity:'Aerosol Products',   weight:125,  pieces:6,  shc:'RFL', status:'Ready for ULD',   dwellMin:90,   handler:'East Africa Cargo',     temp:null,    inboundFlight:null,      outboundFlight:'WB622', route:'NBO-DXB' },
  { awb:'459-71234098', station:'NBO', direction:'Export', zone:'Cool Room', bin:'NBO-Cool-G3-R1', commodity:'Cut Flowers',        weight:1400, pieces:35, shc:'COL', status:'Dwell Alert',     dwellMin:3600, handler:'East Africa Cargo',     temp:'5.2°C', inboundFlight:null,      outboundFlight:'WB204', route:'NBO-AMS' },

  // ── NBO Import ─────────────────────────────────────────────────
  { awb:'459-33445566', station:'NBO', direction:'Import', zone:'General',   bin:'NBO-Gen-F5-R3',  commodity:'Automotive Parts',   weight:560,  pieces:8,  shc:'GEN', status:'Pending Customs', dwellMin:1680, handler:'Southern Air Services', temp:null,    inboundFlight:'WB312',   outboundFlight:null,    route:'JNB-NBO' },
  { awb:'459-29876543', station:'NBO', direction:'Import', zone:'General',   bin:'NBO-Gen-F7-R1',  commodity:'Textbook Shipment',  weight:920,  pieces:24, shc:'GEN', status:'Stored',          dwellMin:360,  handler:'Bidair JNB',            temp:null,    inboundFlight:'WB312',   outboundFlight:null,    route:'JNB-NBO' },
  { awb:'459-63245678', station:'NBO', direction:'Import', zone:'Cool Room', bin:'NBO-Cool-G2-R3', commodity:'Vaccine Shipment',   weight:45,   pieces:2,  shc:'PIL', status:'Stored',          dwellMin:180,  handler:'East Africa Cargo',     temp:'2.8°C', inboundFlight:'WB107',   outboundFlight:null,    route:'LHR-NBO' },
  { awb:'459-47823190', station:'NBO', direction:'Import', zone:'Bulk',      bin:'NBO-Bulk-J1-R1', commodity:'Agricultural Machinery', weight:4500, pieces:3, shc:'GEN', status:'Dwell Alert',  dwellMin:4200, handler:'Cargo Africa Ltd',      temp:null,    inboundFlight:'WB101',   outboundFlight:null,    route:'LOS-NBO' },
  { awb:'459-20212223', station:'NBO', direction:'Import', zone:'General',   bin:'NBO-Gen-F3-R2',  commodity:'Printing Paper',     weight:1100, pieces:20, shc:'GEN', status:'Staged',          dwellMin:600,  handler:'East Africa Cargo',     temp:null,    inboundFlight:'WB204',   outboundFlight:null,    route:'CDG-NBO' },
];

// ── Zone Capacity Data ──────────────────────────────────────────────
export const ZONE_CAPACITY = {
  KGL: {
    General:    { totalSqm: 2400, usedSqm: 1680 },
    'Cool Room': { totalSqm: 600,  usedSqm: 390 },
    'DG Cage':   { totalSqm: 200,  usedSqm: 110 },
    'VAL Vault': { totalSqm: 80,   usedSqm: 32 },
    Bulk:        { totalSqm: 1000, usedSqm: 720 },
  },
  NBO: {
    General:    { totalSqm: 3200, usedSqm: 2240 },
    'Cool Room': { totalSqm: 900,  usedSqm: 630 },
    'DG Cage':   { totalSqm: 300,  usedSqm: 105 },
    'VAL Vault': { totalSqm: 100,  usedSqm: 15 },
    Bulk:        { totalSqm: 1400, usedSqm: 980 },
  }
};

// ── Helper Functions ────────────────────────────────────────────────

export function getInventoryByStation(code) {
  return INVENTORY_ITEMS.filter(i => i.station === code);
}

export function getInventoryByZone(zone) {
  return INVENTORY_ITEMS.filter(i => i.zone === zone);
}

export function getInventoryByDirection(dir) {
  return INVENTORY_ITEMS.filter(i => i.direction === dir);
}

export function getOccupancyStats(station) {
  const zones = ZONE_CAPACITY[station];
  if (!zones) return { totalSqm: 0, usedSqm: 0, pct: 0, zones: {} };
  let totalSqm = 0, usedSqm = 0;
  const zoneStats = {};
  for (const [zone, cap] of Object.entries(zones)) {
    totalSqm += cap.totalSqm;
    usedSqm += cap.usedSqm;
    zoneStats[zone] = { ...cap, pct: Math.round((cap.usedSqm / cap.totalSqm) * 100) };
  }
  return { totalSqm, usedSqm, pct: Math.round((usedSqm / totalSqm) * 100), zones: zoneStats };
}
