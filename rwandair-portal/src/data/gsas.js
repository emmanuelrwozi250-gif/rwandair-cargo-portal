// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — GSA (General Sales Agent) Data
// Source: Cargo GSA.xlsx and GSA Cargo.xlsx (Dec 2025)
// All revenue figures in USD
// ═══════════════════════════════════════════════════════════════════

// FY 2025-26 revenue targets by market (from revenue targets file)
// Used to derive GSA performance targets
const MARKET_TARGETS = {
  'DXB': 8776780, 'LHR': 3056770, 'NBO': 3351597, 'LOS': 504306,
  'BRU': 1483110, 'JNB': 752692, 'EBB': 481783, 'DLA': 211154,
  'DAR': 60755,   'BJM': 33700,   'ACC': 52210,   'BGF': 86876,
};

export const GSAS = [
  // ── UAE / Middle East ────────────────────────────────────────────
  {
    id:'GS0002', code:'GS0002', name:'AL RAIS CARGO', country:'UAE', station:'DXB',
    region:'Middle East', contact:'cargo@alraiscargo.com', phone:'+971 4 282 9000',
    revenueTarget: Math.round(MARKET_TARGETS.DXB * 0.45),  // ~45% of DXB market
    revenueMTD: 731398, revenueFY: 6842000,
    awbCount: 847, avgYield: 2.85, bookingAccuracy: 94.2,
    cassBalance: 883151.82, cassStatus:'Overdue',
    cassNote:'Dec-25 invoice pending. Follow-up required.',
    rag: 'green', pctToTarget: 102, paymentTerms: 'Net 30',
    monthlyTrend: [680000, 715000, 698000, 731000, 742000, 718000,
                   703000, 725000, 731000, 748000, 731000, 720000],
    topCommodities: [
      { name:'Electronics', pct:38 }, { name:'General', pct:28 },
      { name:'Consolidation', pct:18 }, { name:'Perishables', pct:10 }, { name:'DG', pct:6 }
    ],
    topRoutes: ['DXB→KGL','DXB→LOS','DXB→EBB','DXB→BGF'],
  },
  {
    id:'GS0052', code:'GS0052', name:'KALE AIRLINE SERVICES', country:'UAE', station:'DXB',
    region:'Middle East', contact:'ops@kalecargo.ae', phone:'+971 4 299 6600',
    revenueTarget: Math.round(MARKET_TARGETS.DXB * 0.12),
    revenueMTD: 89420, revenueFY: 1053000,
    awbCount: 183, avgYield: 3.10, bookingAccuracy: 91.7,
    cassBalance: 17877.90, cassStatus:'Current',
    cassNote:'Dec-25 invoice acknowledged.',
    rag: 'green', pctToTarget: 98, paymentTerms: 'Net 30',
    monthlyTrend: [82000, 88000, 91000, 86000, 90000, 94000,
                   88000, 87000, 92000, 95000, 89000, 91000],
    topCommodities: [
      { name:'General', pct:42 }, { name:'Electronics', pct:32 },
      { name:'Consolidation', pct:16 }, { name:'DG', pct:10 }
    ],
    topRoutes: ['DXB→KGL','DXB→EBB','DXB→JNB'],
  },
  // ── UK / Europe ──────────────────────────────────────────────────
  {
    id:'GS0038', code:'GS0038', name:'NETWORK AIRLINE SERVICES BV', country:'Netherlands', station:'AMS',
    region:'Europe', contact:'cargo@nas-aviation.com', phone:'+31 20 206 6000',
    revenueTarget: Math.round(MARKET_TARGETS.LHR * 0.35 + MARKET_TARGETS.BRU * 0.55),
    revenueMTD: 234900, revenueFY: 2641000,
    awbCount: 512, avgYield: 4.15, bookingAccuracy: 96.8,
    cassBalance: 318383.10, cassStatus:'Overdue',
    cassNote:'Oct-25 invoice pending. Largest single outstanding balance.',
    rag: 'amber', pctToTarget: 88, paymentTerms: 'Net 45',
    monthlyTrend: [210000, 225000, 219000, 234000, 241000, 228000,
                   218000, 230000, 238000, 245000, 234000, 227000],
    topCommodities: [
      { name:'Perishables', pct:35 }, { name:'General', pct:30 },
      { name:'Pharma', pct:20 }, { name:'Electronics', pct:10 }, { name:'Valuables', pct:5 }
    ],
    topRoutes: ['LHR→KGL','BRU→KGL','CDG→KGL','AMS→KGL'],
  },
  {
    id:'CR0536', code:'CR0536', name:'NETWORK AIRLINE SERVICES', country:'United Kingdom', station:'LHR',
    region:'Europe', contact:'ukops@nas-aviation.com', phone:'+44 20 8831 6900',
    revenueTarget: Math.round(MARKET_TARGETS.LHR * 0.40),
    revenueMTD: 128400, revenueFY: 1412000,
    awbCount: 298, avgYield: 4.30, bookingAccuracy: 95.4,
    cassBalance: 299042.40, cassStatus:'Overdue',
    cassNote:'Three months invoices outstanding. Escalated.',
    rag: 'red', pctToTarget: 74, paymentTerms: 'Net 30',
    monthlyTrend: [112000, 118000, 115000, 125000, 131000, 120000,
                   110000, 121000, 128000, 133000, 128000, 122000],
    topCommodities: [
      { name:'General', pct:40 }, { name:'Perishables', pct:28 },
      { name:'Electronics', pct:18 }, { name:'Pharma', pct:14 }
    ],
    topRoutes: ['LHR→KGL','LHR→NBO','LHR→JNB'],
  },
  // ── East Africa ──────────────────────────────────────────────────
  {
    id:'GS0016', code:'GS0016', name:'BIDAIR CARGO ENTEBBE', country:'Uganda', station:'EBB',
    region:'East Africa', contact:'cargo@bidair.ug', phone:'+256 41 432 8000',
    revenueTarget: Math.round(MARKET_TARGETS.EBB * 0.60),
    revenueMTD: 24890, revenueFY: 289000,
    awbCount: 287, avgYield: 0.97, bookingAccuracy: 92.1,
    cassBalance: 0, cassStatus:'Cleared',
    cassNote:'Fully current. Strong performer.',
    rag: 'green', pctToTarget: 101, paymentTerms: 'Net 30',
    monthlyTrend: [22000, 24000, 23500, 25000, 25500, 24200,
                   23800, 24500, 25200, 25800, 24890, 24600],
    topCommodities: [
      { name:'Auto Spare Parts', pct:45 }, { name:'Electronics', pct:28 },
      { name:'General', pct:18 }, { name:'DG', pct:9 }
    ],
    topRoutes: ['SHJ→EBB','DWC→EBB','DXB→EBB'],
  },
  {
    id:'GS0034', code:'GS0034', name:'GROUPE OBAKE FREDIE CESAIRE', country:'Cameroon', station:'DLA',
    region:'Central Africa', contact:'cargo@obake-dla.com', phone:'+237 233 98 7878',
    revenueTarget: Math.round(MARKET_TARGETS.DLA * 0.55),
    revenueMTD: 9821, revenueFY: 116000,
    awbCount: 142, avgYield: 2.68, bookingAccuracy: 89.3,
    cassBalance: 9293.90, cassStatus:'Pending',
    cassNote:'Oct-25 invoice pending.',
    rag: 'amber', pctToTarget: 82, paymentTerms: 'Net 30',
    monthlyTrend: [8500, 9200, 8800, 9600, 10100, 9400,
                   8900, 9300, 9700, 10200, 9821, 9500],
    topCommodities: [
      { name:'General', pct:50 }, { name:'Electronics', pct:25 },
      { name:'Consolidation', pct:15 }, { name:'Perishables', pct:10 }
    ],
    topRoutes: ['DLA→KGL','DLA→LBV','DLA→BGF'],
  },
  // ── West Africa ───────────────────────────────────────────────────
  {
    id:'GS0039', code:'GS0039', name:'HEAVYWEIGHT AIR EXPRESS', country:'Nigeria', station:'LOS',
    region:'West Africa', contact:'cargo@hwae-nigeria.com', phone:'+234 1 270 8800',
    revenueTarget: Math.round(MARKET_TARGETS.LOS * 0.50),
    revenueMTD: 22814, revenueFY: 252000,
    awbCount: 321, avgYield: 1.28, bookingAccuracy: 87.6,
    cassBalance: 276564.70, cassStatus:'Overdue',
    cassNote:'Oct-25 invoice outstanding. Pattern of late payment.',
    rag: 'red', pctToTarget: 71, paymentTerms: 'Net 30',
    monthlyTrend: [19000, 21000, 20500, 22000, 23500, 21800,
                   20400, 21900, 22700, 23100, 22814, 21900],
    topCommodities: [
      { name:'General', pct:48 }, { name:'Electronics', pct:28 },
      { name:'Consolidation', pct:16 }, { name:'DG', pct:8 }
    ],
    topRoutes: ['LOS→KGL','LOS→NBO','LOS→JNB','LOS→LHR'],
  },
  // ── Southern Africa ───────────────────────────────────────────────
  {
    id:'GS0006', code:'GS0006', name:'BIDAIR CARGO GSA SOUTH AFRICA', country:'South Africa', station:'JNB',
    region:'Southern Africa', contact:'cargo@bidair.co.za', phone:'+27 11 978 4400',
    revenueTarget: Math.round(MARKET_TARGETS.JNB * 0.65),
    revenueMTD: 40810, revenueFY: 489000,
    awbCount: 178, avgYield: 2.42, bookingAccuracy: 93.8,
    cassBalance: 30649.85, cassStatus:'Pending',
    cassNote:'Dec-25 invoice to be settled end Jan-26.',
    rag: 'green', pctToTarget: 97, paymentTerms: 'Net 30',
    monthlyTrend: [37000, 39000, 38500, 41000, 42500, 40200,
                   38800, 40100, 41400, 42800, 40810, 40200],
    topCommodities: [
      { name:'General', pct:42 }, { name:'Consolidation', pct:30 },
      { name:'Pharma', pct:15 }, { name:'Electronics', pct:13 }
    ],
    topRoutes: ['JNB→KGL','JNB→LHR','JNB→NBO'],
  },
  // ── East Africa interline/forwarding ─────────────────────────────
  {
    id:'WB0044', code:'WB0044', name:'SMART AIR CARGO SERVICE', country:'Kenya', station:'NBO',
    region:'East Africa', contact:'ops@smartaircargo.ke', phone:'+254 20 822 5500',
    revenueTarget: Math.round(MARKET_TARGETS.NBO * 0.15),
    revenueMTD: 41895, revenueFY: 502000,
    awbCount: 234, avgYield: 1.82, bookingAccuracy: 91.2,
    cassBalance: 2438.19, cassStatus:'Current',
    rag: 'green', pctToTarget: 100, paymentTerms: 'Net 30',
    monthlyTrend: [38000, 40000, 39500, 42000, 43500, 41200,
                   39800, 41100, 42400, 43800, 41895, 41200],
    topCommodities: [
      { name:'General', pct:38 }, { name:'Perishables', pct:30 },
      { name:'Electronics', pct:18 }, { name:'Pharma', pct:14 }
    ],
    topRoutes: ['NBO→KGL','NBO→EBB','NBO→LHR'],
  },
  // ── Central Africa ────────────────────────────────────────────────
  {
    id:'CR0510', code:'CR0510', name:'ROYAL EXPRESS CAMEROUN', country:'Cameroon', station:'DLA',
    region:'Central Africa', contact:'cargo@royalexpress-cmr.com', phone:'+237 233 18 5050',
    revenueTarget: Math.round(MARKET_TARGETS.DLA * 0.35),
    revenueMTD: 7124, revenueFY: 74000,
    awbCount: 89, avgYield: 2.75, bookingAccuracy: 86.4,
    cassBalance: 22964.76, cassStatus:'Overdue',
    cassNote:'Disputes on POP. Working with commercial director.',
    rag: 'amber', pctToTarget: 79, paymentTerms: 'Net 30',
    monthlyTrend: [5900, 6200, 6100, 6700, 7200, 6800,
                   6400, 6900, 7100, 7400, 7124, 6900],
    topCommodities: [
      { name:'General', pct:55 }, { name:'Electronics', pct:25 },
      { name:'Perishables', pct:12 }, { name:'DG', pct:8 }
    ],
    topRoutes: ['DLA→KGL','DLA→LBV'],
  },
  // ── Burundi ───────────────────────────────────────────────────────
  {
    id:'CR0687', code:'CR0687', name:'BOLLORE LOGISTIC BJM', country:'Burundi', station:'BJM',
    region:'East Africa', contact:'air.bjm@bollore.com', phone:'+257 22 22 3800',
    revenueTarget: Math.round(MARKET_TARGETS.BJM * 0.70),
    revenueMTD: 1964, revenueFY: 23000,
    awbCount: 67, avgYield: 2.50, bookingAccuracy: 88.9,
    cassBalance: 0, cassStatus:'Cleared',
    cassNote:'Cleared. Consistently delayed in reporting.',
    rag: 'green', pctToTarget: 96, paymentTerms: 'Net 30',
    monthlyTrend: [1700, 1850, 1800, 1950, 2100, 1980,
                   1860, 1920, 2000, 2050, 1964, 1910],
    topCommodities: [
      { name:'General', pct:65 }, { name:'Electronics', pct:20 },
      { name:'Perishables', pct:15 }
    ],
    topRoutes: ['BJM→KGL','BJM→NBO'],
  },
  // ── Ghana ─────────────────────────────────────────────────────────
  {
    id:'NEW001', code:'NEW001', name:'ZEAL GLOBAL SERVICES LTD', country:'Ghana', station:'ACC',
    region:'West Africa', contact:'cargo@zealglobal.gh', phone:'+233 302 812 999',
    revenueTarget: Math.round(MARKET_TARGETS.ACC * 0.60),
    revenueMTD: 2608, revenueFY: 31000,
    awbCount: 54, avgYield: 4.05, bookingAccuracy: 90.1,
    cassBalance: 10557.58, cassStatus:'Pending',
    cassNote:'October 25 invoice outstanding.',
    rag: 'amber', pctToTarget: 85, paymentTerms: 'Net 30',
    monthlyTrend: [2200, 2350, 2300, 2500, 2700, 2550,
                   2400, 2480, 2570, 2640, 2608, 2540],
    topCommodities: [
      { name:'Electronics', pct:45 }, { name:'General', pct:35 },
      { name:'Mobile Phones', pct:20 }
    ],
    topRoutes: ['SHJ→ACC','DWC→ACC','ACC→KGL'],
  },
];

// GSA CASS outstanding summary
export const CASS_SUMMARY = {
  totalOutstanding: GSAS.reduce((s, g) => s + g.cassBalance, 0),
  overdue: GSAS.filter(g => g.cassStatus === 'Overdue'),
  pending: GSAS.filter(g => g.cassStatus === 'Pending'),
  cleared: GSAS.filter(g => g.cassStatus === 'Cleared'),
};

/** Get GSA by station */
export function getGSAsByStation(station) {
  return GSAS.filter(g => g.station === station);
}

/** Get top N GSAs by revenue MTD */
export function getTopGSAs(n = 5) {
  return [...GSAS].sort((a, b) => b.revenueMTD - a.revenueMTD).slice(0, n);
}

/** Get GSAs with overdue CASS */
export function getOverdueGSAs() {
  return GSAS.filter(g => g.cassBalance > 0).sort((a, b) => b.cassBalance - a.cassBalance);
}
