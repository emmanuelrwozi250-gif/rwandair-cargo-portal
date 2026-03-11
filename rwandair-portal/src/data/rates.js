// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Rate Cards
// Source: Actual published rates from December 2025 Monthly Report
// AWB Prefix: 459 (WB IATA prefix)
// ═══════════════════════════════════════════════════════════════════

// Actual published rates extracted from Dec-2025 operations ($/kg)
export const RATE_CARDS = [
  // ── UAE Origins → Africa ─────────────────────────────────────────
  { id: 'SHJ-KGL', origin:'SHJ', originCity:'Sharjah', destination:'KGL', destinationCity:'Kigali',
    commodity:'General', baseRate:3.15, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.05 }, { date:'2025-04-01', rate:2.95 }, { date:'2024-10-01', rate:2.85 }
    ]},
  { id: 'SHJ-KGL-ELI', origin:'SHJ', originCity:'Sharjah', destination:'KGL', destinationCity:'Kigali',
    commodity:'Electronics', baseRate:3.35, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.25 }, { date:'2025-04-01', rate:3.15 }
    ]},
  { id: 'DWC-KGL', origin:'DWC', originCity:'Dubai Al Maktoum', destination:'KGL', destinationCity:'Kigali',
    commodity:'General', baseRate:3.15, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.05 }, { date:'2025-04-01', rate:2.90 }
    ]},
  { id: 'DXB-KGL', origin:'DXB', originCity:'Dubai International', destination:'KGL', destinationCity:'Kigali',
    commodity:'General', baseRate:3.35, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.20 }, { date:'2025-04-01', rate:3.05 }
    ]},
  { id: 'SHJ-EBB', origin:'SHJ', originCity:'Sharjah', destination:'EBB', destinationCity:'Entebbe',
    commodity:'General', baseRate:0.95, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:0.95 }, { date:'2025-04-01', rate:0.90 }
    ]},
  { id: 'DWC-EBB', origin:'DWC', originCity:'Dubai Al Maktoum', destination:'EBB', destinationCity:'Entebbe',
    commodity:'General', baseRate:0.95, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:0.95 }, { date:'2025-04-01', rate:0.90 }
    ]},
  { id: 'SHJ-LOS', origin:'SHJ', originCity:'Sharjah', destination:'LOS', destinationCity:'Lagos',
    commodity:'General', baseRate:1.25, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:1.25 }, { date:'2025-04-01', rate:1.20 }
    ]},
  { id: 'DWC-LOS', origin:'DWC', originCity:'Dubai Al Maktoum', destination:'LOS', destinationCity:'Lagos',
    commodity:'General', baseRate:1.25, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:1.25 }, { date:'2025-04-01', rate:1.20 }
    ]},
  { id: 'SHJ-BGF', origin:'SHJ', originCity:'Sharjah', destination:'BGF', destinationCity:'Bangui',
    commodity:'General', baseRate:2.65, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:2.50 }, { date:'2025-04-01', rate:2.40 }
    ]},
  { id: 'SHJ-JNB', origin:'SHJ', originCity:'Sharjah', destination:'JNB', destinationCity:'Johannesburg',
    commodity:'General', baseRate:2.95, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:2.80 }, { date:'2025-04-01', rate:2.70 }
    ]},
  { id: 'SHJ-JUB', origin:'SHJ', originCity:'Sharjah', destination:'JUB', destinationCity:'Juba',
    commodity:'General', baseRate:1.45, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:1.45 }, { date:'2025-04-01', rate:1.40 }
    ]},
  { id: 'SHJ-ACC', origin:'SHJ', originCity:'Sharjah', destination:'ACC', destinationCity:'Accra',
    commodity:'General', baseRate:4.12, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.91 }, { date:'2025-04-01', rate:3.75 }
    ]},
  // ── KGL outbound ─────────────────────────────────────────────────
  { id: 'KGL-LHR', origin:'KGL', originCity:'Kigali', destination:'LHR', destinationCity:'London',
    commodity:'General', baseRate:4.50, minCharge:200, fuelSurch:0.75, secSurch:0.15, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:4.25 }, { date:'2025-04-01', rate:4.00 }
    ]},
  { id: 'KGL-LHR-PERI', origin:'KGL', originCity:'Kigali', destination:'LHR', destinationCity:'London',
    commodity:'Perishables (Flowers/Produce)', baseRate:3.20, minCharge:200, fuelSurch:0.75, secSurch:0.15, handling:20,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:3.00 }, { date:'2025-04-01', rate:2.80 }
    ]},
  { id: 'KGL-CDG', origin:'KGL', originCity:'Kigali', destination:'CDG', destinationCity:'Paris',
    commodity:'General', baseRate:4.20, minCharge:200, fuelSurch:0.75, secSurch:0.15, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:4.00 }, { date:'2025-04-01', rate:3.80 }
    ]},
  { id: 'KGL-BRU', origin:'KGL', originCity:'Kigali', destination:'BRU', destinationCity:'Brussels',
    commodity:'General', baseRate:4.20, minCharge:200, fuelSurch:0.75, secSurch:0.15, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:4.00 }, { date:'2025-04-01', rate:3.80 }
    ]},
  { id: 'KGL-DXB', origin:'KGL', originCity:'Kigali', destination:'DXB', destinationCity:'Dubai',
    commodity:'General', baseRate:2.50, minCharge:170, fuelSurch:0.55, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:2.40 }, { date:'2025-04-01', rate:2.30 }
    ]},
  { id: 'KGL-LOS', origin:'KGL', originCity:'Kigali', destination:'LOS', destinationCity:'Lagos',
    commodity:'General', baseRate:2.80, minCharge:170, fuelSurch:0.55, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:2.70 }, { date:'2025-04-01', rate:2.60 }
    ]},
  { id: 'KGL-JNB', origin:'KGL', originCity:'Kigali', destination:'JNB', destinationCity:'Johannesburg',
    commodity:'General', baseRate:2.40, minCharge:170, fuelSurch:0.50, secSurch:0.10, handling:15,
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:2.30 }, { date:'2025-04-01', rate:2.20 }
    ]},
  // ── Special Cargo Rates ───────────────────────────────────────────
  { id: 'HUM-UAE-AFRICA', origin:'UAE', originCity:'UAE Stations', destination:'Africa', destinationCity:'Various',
    commodity:'Human Remains (HUM)', baseRate:9.00, minCharge:170, fuelSurch:0.65, secSurch:0.10, handling:15,
    notes:'DXB→BJM: $8.625 | DXB→DLA: $9.00 | DXB→ACC: $9.775',
    effectiveDate:'2025-10-26', expiryDate:'2026-03-28', season:'W25', currency:'USD', history:[
      { date:'2025-07-01', rate:8.75 }, { date:'2025-04-01', rate:8.50 }
    ]},
];

// Current surcharges (applied on top of base rate)
export const SURCHARGES = [
  { id:'FSC', name:'Fuel Surcharge', code:'FSC', type:'percentage', value:21, unit:'%', active:true,
    description:'Applied to base freight charge', effectiveDate:'2025-11-01', review:'monthly' },
  { id:'SSC', name:'Security Surcharge', code:'SSC', type:'per_kg', value:0.10, unit:'$/kg', active:true,
    description:'ICAO/IATA security fee per kg', effectiveDate:'2025-10-26', review:'seasonal' },
  { id:'AWB', name:'AWB Fee', code:'AWB', type:'flat', value:15, unit:'$/AWB', active:true,
    description:'Air Waybill issuance fee', effectiveDate:'2025-01-01', review:'annual' },
  { id:'SCC', name:'Screening/Cool Chain', code:'SCC', type:'per_kg', value:0.25, unit:'$/kg', active:true,
    description:'Temperature-controlled cargo screening', effectiveDate:'2025-10-26', review:'seasonal' },
  { id:'DGR', name:'Dangerous Goods Acceptance', code:'DGR', type:'flat', value:50, unit:'$/AWB', active:true,
    description:'DG documentation and acceptance check', effectiveDate:'2025-01-01', review:'annual' },
  { id:'OHC', name:'Oversize Handling', code:'OHC', type:'flat', value:75, unit:'$/shipment', active:true,
    description:'Cargo exceeding 300cm or 500kg per piece', effectiveDate:'2025-01-01', review:'annual' },
  { id:'PER', name:'Perishable Handling', code:'PER', type:'per_kg', value:0.15, unit:'$/kg', active:true,
    description:'Cool room storage and priority handling', effectiveDate:'2025-10-26', review:'seasonal' },
  { id:'VAL', name:'Valuables Surcharge', code:'VAL', type:'per_kg', value:2.50, unit:'$/kg', active:false,
    description:'Declared value cargo >$1000/kg', effectiveDate:'2025-01-01', review:'annual' },
];

// IATA Cargo type codes used by WB
export const CARGO_TYPES = [
  { code:'GEN', label:'General Cargo', description:'Standard durable goods' },
  { code:'ELI', label:'Electronics (Lithium)', description:'Electronic items with lithium batteries' },
  { code:'EAP', label:'Electronics (No Battery)', description:'Electronic items without batteries' },
  { code:'EAW', label:'Electronics General', description:'Electrical/electronic general' },
  { code:'ELM', label:'Electrical Items', description:'Electrical machinery and equipment' },
  { code:'PER', label:'Perishables', description:'Perishable goods — fruits, vegetables, flowers' },
  { code:'COL', label:'Cold Chain', description:'Temperature controlled — 2–8°C' },
  { code:'ICE', label:'Frozen', description:'Frozen goods — maintained <-18°C' },
  { code:'PIL', label:'Pharma (PIL)', description:'Pharmaceutical requiring PIL documentation' },
  { code:'HUM', label:'Human Remains', description:'Embalmed human remains — requires death cert' },
  { code:'MAG', label:'Magnetic', description:'Magnetic material — NOTOC required' },
  { code:'RFL', label:'DG Class 3 (Flammable)', description:'Flammable liquids' },
  { code:'RCM', label:'DG Corrosives', description:'Corrosive substances' },
  { code:'RBI', label:'DG Infectious', description:'Biological substances — Category B' },
  { code:'CAO', label:'Cargo Aircraft Only', description:'Forbidden on passenger aircraft' },
  { code:'RMD', label:'DG Misc.', description:'Miscellaneous dangerous goods' },
  { code:'RPB', label:'DG Toxic', description:'Toxic substances' },
  { code:'AVI', label:'Live Animals', description:'Requires IATA LAR compliance' },
  { code:'VAL', label:'Valuables', description:'Gold, currency, securities — requires GoR auth' },
  { code:'DIP', label:'Diplomatic Mail', description:'Government diplomatic pouches' },
  { code:'GCR', label:'General Cargo Resale', description:'Consolidation general cargo' },
  { code:'FOC', label:'Free of Charge', description:'Operational/Company material — COMAT' },
];

// AWB prefix: 459 (RwandAir's IATA numeric code)
export const AWB_PREFIX = '459';

/**
 * Calculate total charge for a shipment
 * @param {string} routeId - Route ID from RATE_CARDS
 * @param {number} grossKg - Actual gross weight in kg
 * @param {number} cbm - Volume in cubic metres
 * @returns {Object} Full charge breakdown
 */
export function calculateCharge(routeId, grossKg, cbm = 0) {
  const rate = RATE_CARDS.find(r => r.id === routeId);
  if (!rate) return null;
  const volKg = cbm * 167;           // IATA volumetric divisor
  const chargeableKg = Math.max(grossKg, volKg);
  const freight = Math.max(chargeableKg * rate.baseRate, rate.minCharge);
  const fuel = freight * (rate.fuelSurch / 1);
  const security = chargeableKg * rate.secSurch;
  const awbFee = rate.handling;
  const total = freight + fuel + security + awbFee;
  return {
    grossKg, volKg: Math.round(volKg), chargeableKg: Math.round(chargeableKg),
    baseRate: rate.baseRate, freight: round2(freight),
    fuelSurch: round2(fuel), secSurch: round2(security),
    awbFee, total: round2(total),
    volumetricUsed: volKg > grossKg
  };
}

function round2(n) { return Math.round(n * 100) / 100; }

/** Get all rates for a given origin */
export function getRatesByOrigin(origin) {
  return RATE_CARDS.filter(r => r.origin === origin);
}

/** Get rate for specific O&D */
export function getRate(origin, destination, commodity = 'General') {
  return RATE_CARDS.find(r => r.origin === origin && r.destination === destination &&
    (r.commodity === commodity || r.commodity === 'General')) || null;
}
