// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Intelligence — Disruption Events Data
// Mock disruption records with rebooking options & resolution notes
// ═══════════════════════════════════════════════════════════════════

// ── Disruption type definitions ─────────────────────────────────
export const DISRUPTION_TYPES = {
  'Offloaded':         { label: 'Offloaded',          color: '#E53E3E', icon: 'alert-triangle' },
  'Flight Cancelled':  { label: 'Flight Cancelled',   color: '#C53030', icon: 'alert-circle' },
  'Capacity Shortage': { label: 'Capacity Shortage',  color: '#D97706', icon: 'alert-triangle' },
  'Weather Delay':     { label: 'Weather Delay',      color: '#2B6CB0', icon: 'cloud' },
  'Technical':         { label: 'Technical',           color: '#805AD5', icon: 'settings' }
};

// ── Status definitions ──────────────────────────────────────────
export const DISRUPTION_STATUSES = {
  'New':               { label: 'New',               color: '#E53E3E', bg: '#FEE2E2' },
  'Notified':          { label: 'Notified',          color: '#D97706', bg: '#FEF3C7' },
  'Options Sent':      { label: 'Options Sent',      color: '#2563EB', bg: '#DBEAFE' },
  'Client Confirmed':  { label: 'Client Confirmed',  color: '#7C3AED', bg: '#EDE9FE' },
  'Rebooked':          { label: 'Rebooked',          color: '#059669', bg: '#D1FAE5' },
  'Resolved':          { label: 'Resolved',          color: '#6B7280', bg: '#F3F4F6' }
};

// ── Disruption records ──────────────────────────────────────────
export const DISRUPTIONS = [
  // ── Status: New (2) ───────────────────────────────────────────
  {
    id: 'DIS-2026-001',
    awb: '459-66281540',
    originalFlight: 'WB700',
    disruptionType: 'Offloaded',
    reason: 'Capacity shortage on WB700 NBO-KGL segment. Priority given to perishable cargo.',
    station: 'NBO',
    timestamp: '2026-03-12T06:15:00Z',
    status: 'New',
    shipper: 'Bollore Transport & Logistics',
    consignee: 'Rwanda Trading Co. Ltd',
    weight: 820,
    commodity: 'General Cargo — Textiles',
    shc: 'GEN',
    priority: 'High',
    rebookingOptions: [
      { flight: 'WB202', route: 'NBO-KGL', departure: '2026-03-12T14:30:00Z', availableKg: 1200, eta: '2026-03-12T15:45:00Z', additionalCost: 0, recommended: true },
      { flight: 'WB710', route: 'NBO-KGL (via EBB)', departure: '2026-03-13T08:00:00Z', availableKg: 3400, eta: '2026-03-13T11:30:00Z', additionalCost: 45, recommended: false },
      { flight: 'KQ530', route: 'NBO-KGL (interline)', departure: '2026-03-12T18:20:00Z', availableKg: 600, eta: '2026-03-12T19:35:00Z', additionalCost: 120, recommended: false }
    ],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: '2026-03-12T06:15:00Z', action: 'Disruption Created', by: 'System', detail: 'AWB 459-66281540 offloaded from WB700. Capacity shortage.' }
    ]
  },
  {
    id: 'DIS-2026-002',
    awb: '459-64830019',
    originalFlight: 'WB622',
    disruptionType: 'Weather Delay',
    reason: 'Heavy fog at LHR causing ground stop. Departure delayed 4+ hours.',
    station: 'LHR',
    timestamp: '2026-03-12T05:40:00Z',
    status: 'New',
    shipper: 'DHL Global Forwarding UK',
    consignee: 'Kigali Pharma Distributors',
    weight: 350,
    commodity: 'Pharmaceuticals — Temperature Controlled',
    shc: 'PIL',
    priority: 'Critical',
    rebookingOptions: [
      { flight: 'WB711', route: 'LHR-KGL', departure: '2026-03-12T22:15:00Z', availableKg: 800, eta: '2026-03-13T07:30:00Z', additionalCost: 0, recommended: true },
      { flight: 'WB622', route: 'LHR-KGL (rescheduled)', departure: '2026-03-12T16:00:00Z', availableKg: 2200, eta: '2026-03-13T01:15:00Z', additionalCost: 0, recommended: false },
      { flight: 'BA65', route: 'LHR-NBO-KGL (interline)', departure: '2026-03-12T20:45:00Z', availableKg: 500, eta: '2026-03-13T10:00:00Z', additionalCost: 210, recommended: false }
    ],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: '2026-03-12T05:40:00Z', action: 'Disruption Created', by: 'System', detail: 'WB622 delayed due to heavy fog at Heathrow. Ground stop in effect.' }
    ]
  },

  // ── Status: Notified (1) ──────────────────────────────────────
  {
    id: 'DIS-2026-003',
    awb: '459-64851203',
    originalFlight: 'WB710',
    disruptionType: 'Offloaded',
    reason: 'DG irregularity — NOTOC discrepancy identified during acceptance check.',
    station: 'KGL',
    timestamp: '2026-03-11T22:30:00Z',
    status: 'Notified',
    shipper: 'CIMERWA PLC',
    consignee: 'Gulf Industrial Chemicals LLC',
    weight: 560,
    commodity: 'Industrial Chemicals — Dangerous Goods',
    shc: 'DGR',
    priority: 'Critical',
    rebookingOptions: [
      { flight: 'WB710', route: 'KGL-DXB', departure: '2026-03-12T23:45:00Z', availableKg: 4200, eta: '2026-03-13T06:30:00Z', additionalCost: 0, recommended: true },
      { flight: 'WB9316', route: 'KGL-DWC', departure: '2026-03-13T10:00:00Z', availableKg: 5800, eta: '2026-03-13T17:15:00Z', additionalCost: 30, recommended: false }
    ],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: '2026-03-11T22:30:00Z', action: 'Disruption Created', by: 'System', detail: 'AWB 459-64851203 offloaded from WB710. NOTOC discrepancy.' },
      { time: '2026-03-11T23:05:00Z', action: 'Client Notified', by: 'Aline Ndayishimiye', detail: 'Notified CIMERWA PLC via email and phone. Awaiting corrected NOTOC.' }
    ]
  },

  // ── Status: Options Sent (2) ──────────────────────────────────
  {
    id: 'DIS-2026-004',
    awb: '459-64840055',
    originalFlight: 'WB9316',
    disruptionType: 'Capacity Shortage',
    reason: 'Freighter WB9316 at max payload. AWB bumped due to lower priority rating.',
    station: 'DXB',
    timestamp: '2026-03-11T14:20:00Z',
    status: 'Options Sent',
    shipper: 'Al Rais Cargo LLC',
    consignee: 'Kigali Fresh Imports',
    weight: 1840,
    commodity: 'Perishables — Fresh Flowers',
    shc: 'PER',
    priority: 'High',
    rebookingOptions: [
      { flight: 'WB9316', route: 'DWC-KGL', departure: '2026-03-13T10:00:00Z', availableKg: 3200, eta: '2026-03-13T14:45:00Z', additionalCost: 0, recommended: false },
      { flight: 'WB700', route: 'DXB-NBO-KGL', departure: '2026-03-12T15:30:00Z', availableKg: 2000, eta: '2026-03-12T22:00:00Z', additionalCost: 85, recommended: true },
      { flight: 'EK721', route: 'DXB-NBO (interline) + WB202', departure: '2026-03-12T09:00:00Z', availableKg: 1500, eta: '2026-03-12T19:30:00Z', additionalCost: 250, recommended: false }
    ],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: '2026-03-11T14:20:00Z', action: 'Disruption Created', by: 'System', detail: 'AWB 459-64840055 bumped from WB9316. Payload limit exceeded.' },
      { time: '2026-03-11T14:45:00Z', action: 'Client Notified', by: 'Ahmed Al Rashid', detail: 'Al Rais Cargo notified via phone. Urgent — perishable cargo.' },
      { time: '2026-03-11T15:10:00Z', action: 'Options Sent', by: 'Ahmed Al Rashid', detail: '3 rebooking options emailed to client with cost breakdown.' }
    ]
  },
  {
    id: 'DIS-2026-005',
    awb: '459-64812566',
    originalFlight: 'WB701',
    disruptionType: 'Flight Cancelled',
    reason: 'WB701 CDG-KGL cancelled due to crew scheduling issue. Aircraft repositioned.',
    station: 'CDG',
    timestamp: '2026-03-11T08:00:00Z',
    status: 'Options Sent',
    shipper: 'Paris Fashion House',
    consignee: 'Kigali Convention Centre',
    weight: 48,
    commodity: 'Valuables — Fashion Exhibition Pieces',
    shc: 'VAL',
    priority: 'Medium',
    rebookingOptions: [
      { flight: 'WB701', route: 'CDG-KGL (rescheduled)', departure: '2026-03-13T07:00:00Z', availableKg: 4800, eta: '2026-03-13T16:15:00Z', additionalCost: 0, recommended: true },
      { flight: 'AF860', route: 'CDG-NBO (interline) + WB202', departure: '2026-03-12T10:30:00Z', availableKg: 300, eta: '2026-03-13T08:00:00Z', additionalCost: 180, recommended: false }
    ],
    selectedOption: null,
    clientResponse: null,
    resolvedAt: null,
    notes: [
      { time: '2026-03-11T08:00:00Z', action: 'Disruption Created', by: 'System', detail: 'WB701 cancelled. Crew scheduling issue at CDG.' },
      { time: '2026-03-11T08:30:00Z', action: 'Client Notified', by: 'Jean-Claude Nziza', detail: 'Paris Fashion House notified of cancellation. Apology extended.' },
      { time: '2026-03-11T09:15:00Z', action: 'Options Sent', by: 'Jean-Claude Nziza', detail: '2 rebooking options provided. Client reviewing.' }
    ]
  },

  // ── Status: Client Confirmed (1) ──────────────────────────────
  {
    id: 'DIS-2026-006',
    awb: '459-64813677',
    originalFlight: 'WB202',
    disruptionType: 'Technical',
    reason: 'Aircraft tech issue — WB202 B737-800 hydraulic warning. Cargo transferred.',
    station: 'NBO',
    timestamp: '2026-03-10T16:00:00Z',
    status: 'Client Confirmed',
    shipper: 'CDG Medical Supplies',
    consignee: 'Nairobi General Hospital',
    weight: 640,
    commodity: 'Pharmaceuticals — Medical Supplies',
    shc: 'PIL',
    priority: 'Critical',
    rebookingOptions: [
      { flight: 'WB201', route: 'NBO-KGL', departure: '2026-03-11T10:45:00Z', availableKg: 1800, eta: '2026-03-11T12:00:00Z', additionalCost: 0, recommended: true },
      { flight: 'KQ530', route: 'NBO-KGL (interline)', departure: '2026-03-10T21:00:00Z', availableKg: 800, eta: '2026-03-10T22:15:00Z', additionalCost: 95, recommended: false },
      { flight: 'WB700', route: 'NBO-DXB-KGL', departure: '2026-03-11T06:00:00Z', availableKg: 3000, eta: '2026-03-11T18:30:00Z', additionalCost: 150, recommended: false }
    ],
    selectedOption: 0,
    clientResponse: 'Accepted',
    resolvedAt: null,
    notes: [
      { time: '2026-03-10T16:00:00Z', action: 'Disruption Created', by: 'System', detail: 'WB202 tech issue. Hydraulic warning light. Cargo offloaded.' },
      { time: '2026-03-10T16:20:00Z', action: 'Client Notified', by: 'Mary Wanjiru', detail: 'CDG Medical Supplies notified. Urgent medical shipment flagged.' },
      { time: '2026-03-10T16:45:00Z', action: 'Options Sent', by: 'David Ochieng', detail: '3 rebooking options provided with priority handling note.' },
      { time: '2026-03-10T17:30:00Z', action: 'Client Confirmed', by: 'David Ochieng', detail: 'Client selected Option 1: WB201 NBO-KGL. No additional cost.' }
    ]
  },

  // ── Status: Resolved (2) ──────────────────────────────────────
  {
    id: 'DIS-2026-007',
    awb: '459-64803344',
    originalFlight: 'WB710',
    disruptionType: 'Offloaded',
    reason: 'Weight restriction due to headwinds on KGL-DXB sector. 300kg offloaded.',
    station: 'KGL',
    timestamp: '2026-03-09T21:00:00Z',
    status: 'Resolved',
    shipper: 'British Airways Cargo',
    consignee: 'Dubai Logistics Hub FZE',
    weight: 340,
    commodity: 'General Cargo — Transit',
    shc: 'GEN',
    priority: 'Medium',
    rebookingOptions: [
      { flight: 'WB710', route: 'KGL-DXB', departure: '2026-03-10T23:45:00Z', availableKg: 4500, eta: '2026-03-11T06:30:00Z', additionalCost: 0, recommended: true },
      { flight: 'WB9316', route: 'KGL-DWC', departure: '2026-03-10T10:00:00Z', availableKg: 6000, eta: '2026-03-10T17:15:00Z', additionalCost: 20, recommended: false }
    ],
    selectedOption: 0,
    clientResponse: 'Accepted',
    resolvedAt: '2026-03-11T07:15:00Z',
    notes: [
      { time: '2026-03-09T21:00:00Z', action: 'Disruption Created', by: 'System', detail: 'AWB 459-64803344 offloaded. Weight restriction KGL-DXB.' },
      { time: '2026-03-09T21:15:00Z', action: 'Client Notified', by: 'James Kamau', detail: 'BA Cargo notified at KGL office. Transit shipment held.' },
      { time: '2026-03-09T21:45:00Z', action: 'Options Sent', by: 'Aline Ndayishimiye', detail: '2 options sent. Next day WB710 recommended.' },
      { time: '2026-03-09T22:30:00Z', action: 'Client Confirmed', by: 'Aline Ndayishimiye', detail: 'BA Cargo confirmed next WB710 departure. No extra cost.' },
      { time: '2026-03-10T23:50:00Z', action: 'Rebooked', by: 'James Kamau', detail: 'AWB loaded on WB710 KGL-DXB. Departure confirmed.' },
      { time: '2026-03-11T07:15:00Z', action: 'Resolved', by: 'Fatima Osei', detail: 'Cargo arrived DXB. Delivered to warehouse. Case closed.' }
    ]
  },
  {
    id: 'DIS-2026-008',
    awb: '459-66283099',
    originalFlight: 'WB700',
    disruptionType: 'Capacity Shortage',
    reason: 'WB700 NBO-DXB fully booked. Lower-priority GEN cargo bumped for PER.',
    station: 'NBO',
    timestamp: '2026-03-08T11:00:00Z',
    status: 'Resolved',
    shipper: 'Kuehne + Nagel Kenya',
    consignee: 'Jumeirah Hotels & Resorts',
    weight: 2200,
    commodity: 'Perishables — Fresh Produce',
    shc: 'PER',
    priority: 'High',
    rebookingOptions: [
      { flight: 'WB700', route: 'NBO-DXB', departure: '2026-03-09T06:00:00Z', availableKg: 4000, eta: '2026-03-09T12:30:00Z', additionalCost: 0, recommended: true },
      { flight: 'WB9316', route: 'NBO-KGL-DWC', departure: '2026-03-08T16:00:00Z', availableKg: 2800, eta: '2026-03-09T17:15:00Z', additionalCost: 110, recommended: false },
      { flight: 'KQ310', route: 'NBO-DXB (interline)', departure: '2026-03-08T23:30:00Z', availableKg: 3000, eta: '2026-03-09T05:00:00Z', additionalCost: 280, recommended: false }
    ],
    selectedOption: 0,
    clientResponse: 'Accepted',
    resolvedAt: '2026-03-09T13:00:00Z',
    notes: [
      { time: '2026-03-08T11:00:00Z', action: 'Disruption Created', by: 'System', detail: 'AWB 459-66283099 bumped from WB700. Capacity shortage NBO-DXB.' },
      { time: '2026-03-08T11:20:00Z', action: 'Client Notified', by: 'Mary Wanjiru', detail: 'Kuehne + Nagel Kenya notified. Perishable — time-sensitive.' },
      { time: '2026-03-08T11:50:00Z', action: 'Options Sent', by: 'David Ochieng', detail: '3 options sent. Next day WB700 recommended to maintain cold chain.' },
      { time: '2026-03-08T12:30:00Z', action: 'Client Confirmed', by: 'David Ochieng', detail: 'Client accepted Option 1: next WB700 departure. No extra cost.' },
      { time: '2026-03-09T06:10:00Z', action: 'Rebooked', by: 'Sarah Muthoni', detail: 'AWB loaded on WB700. Cool chain maintained. Departure on time.' },
      { time: '2026-03-09T13:00:00Z', action: 'Resolved', by: 'Ahmed Al Rashid', detail: 'Cargo delivered DXB. Cold chain verified. Case closed.' }
    ]
  }
];

// ── Helper functions ────────────────────────────────────────────

export function getActiveDisruptions() {
  return DISRUPTIONS.filter(d => d.status !== 'Resolved');
}

export function getDisruptionsByStatus(status) {
  return DISRUPTIONS.filter(d => d.status === status);
}

export function getDisruptionByAwb(awb) {
  return DISRUPTIONS.find(d => d.awb === awb) || null;
}

export function getDisruptionById(id) {
  return DISRUPTIONS.find(d => d.id === id) || null;
}
