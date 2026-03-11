// ═══════════════════════════════════════════════════════════════════
// RwandAir Cargo Portal — Station Master Data
// Source: Derived from W25/S26 official schedules + FY 2025-26 revenue targets
// 24 stations across Africa, Europe, and Middle East
// ═══════════════════════════════════════════════════════════════════

export const STATIONS = [
  // ── HUB ──────────────────────────────────────────────────────────
  { code:'KGL', city:'Kigali', country:'Rwanda', region:'East Africa', lat:-1.9706, lng:30.1044, type:'Hub',
    revenueTarget:11261912, capacity:{belly:14000, aircraft:['A330-200','B737-800','Q400']},
    dwellSLA:48, load:72, dwellAlerts:3, revMTD:892400, topRoute:'KGL-LHR',
    contacts:{cargo:'+250 738 306 074', email:'cargo@rwandair.com'} },
  // ── EUROPE ───────────────────────────────────────────────────────
  { code:'LHR', city:'London Heathrow', country:'United Kingdom', region:'Europe', lat:51.4700, lng:-0.4543, type:'Gateway',
    revenueTarget:3056770, capacity:{belly:14000, aircraft:['A330-200']},
    dwellSLA:48, load:88, dwellAlerts:1, revMTD:254731, topRoute:'LHR-KGL',
    contacts:{cargo:'+44 20 8745 7777', email:'lhr.cargo@rwandair.com'} },
  { code:'CDG', city:'Paris CDG', country:'France', region:'Europe', lat:49.0097, lng:2.5479, type:'Gateway',
    revenueTarget:502619, capacity:{belly:14000, aircraft:['A330-200']},
    dwellSLA:48, load:71, dwellAlerts:0, revMTD:41884, topRoute:'CDG-KGL',
    contacts:{cargo:'+33 1 4862 2222', email:'cdg.cargo@rwandair.com'} },
  { code:'BRU', city:'Brussels', country:'Belgium', region:'Europe', lat:50.9010, lng:4.4844, type:'Gateway',
    revenueTarget:1483110, capacity:{belly:14000, aircraft:['A330-200']},
    dwellSLA:48, load:65, dwellAlerts:2, revMTD:123593, topRoute:'BRU-CDG',
    contacts:{cargo:'+32 2 753 4242', email:'bru.cargo@rwandair.com'} },
  // ── MIDDLE EAST ───────────────────────────────────────────────────
  { code:'DXB', city:'Dubai International', country:'UAE', region:'Middle East', lat:25.2532, lng:55.3657, type:'Gateway',
    revenueTarget:8776780, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:24, load:79, dwellAlerts:1, revMTD:731398, topRoute:'DXB-KGL',
    contacts:{cargo:'+971 4 224 5555', email:'dxb.cargo@rwandair.com'} },
  { code:'DOH', city:'Doha Hamad', country:'Qatar', region:'Middle East', lat:25.2731, lng:51.6082, type:'Gateway',
    revenueTarget:24959, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:24, load:62, dwellAlerts:0, revMTD:2080, topRoute:'DOH-KGL',
    contacts:{cargo:'+974 4010 1234', email:'doh.cargo@rwandair.com'} },
  // ── WEST AFRICA ───────────────────────────────────────────────────
  { code:'LOS', city:'Lagos Murtala Muhammed', country:'Nigeria', region:'West Africa', lat:6.5774, lng:3.3212, type:'Key Station',
    revenueTarget:504306, capacity:{belly:14000, aircraft:['A330-200']},
    dwellSLA:48, load:72, dwellAlerts:0, revMTD:42026, topRoute:'LOS-KGL',
    contacts:{cargo:'+234 1 4616 700', email:'los.cargo@rwandair.com'} },
  { code:'ACC', city:'Accra Kotoka', country:'Ghana', region:'West Africa', lat:5.6052, lng:-0.1668, type:'Station',
    revenueTarget:52210, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:48, dwellAlerts:0, revMTD:4351, topRoute:'ACC-KGL',
    contacts:{cargo:'+233 302 773 321', email:'acc.cargo@rwandair.com'} },
  // ── CENTRAL AFRICA ────────────────────────────────────────────────
  { code:'DLA', city:'Douala', country:'Cameroon', region:'Central Africa', lat:4.0061, lng:9.7195, type:'Key Station',
    revenueTarget:211154, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:55, dwellAlerts:2, revMTD:17596, topRoute:'DLA-KGL',
    contacts:{cargo:'+237 233 42 5252', email:'dla.cargo@rwandair.com'} },
  { code:'LBV', city:'Libreville', country:'Gabon', region:'Central Africa', lat:0.4581, lng:9.4122, type:'Station',
    revenueTarget:27272, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:41, dwellAlerts:0, revMTD:2273, topRoute:'LBV-DLA',
    contacts:{cargo:'+241 01 73 6262', email:'lbv.cargo@rwandair.com'} },
  { code:'BGF', city:"Bangui M'Poko", country:'C.A.R.', region:'Central Africa', lat:4.3985, lng:18.5188, type:'Station',
    revenueTarget:86876, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:38, dwellAlerts:1, revMTD:7240, topRoute:'BGF-KGL',
    contacts:{cargo:'+236 21 61 4444', email:'bgf.cargo@rwandair.com'} },
  // ── SOUTHERN AFRICA ───────────────────────────────────────────────
  { code:'JNB', city:'Johannesburg OR Tambo', country:'South Africa', region:'Southern Africa', lat:-26.1392, lng:28.2460, type:'Key Station',
    revenueTarget:752692, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:65, dwellAlerts:0, revMTD:62724, topRoute:'JNB-KGL',
    contacts:{cargo:'+27 11 978 5555', email:'jnb.cargo@rwandair.com'} },
  { code:'LUN', city:'Lusaka Kenneth Kaunda', country:'Zambia', region:'Southern Africa', lat:-15.3308, lng:28.4523, type:'Station',
    revenueTarget:30599, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:44, dwellAlerts:0, revMTD:2550, topRoute:'LUN-KGL',
    contacts:{cargo:'+260 211 271 281', email:'lun.cargo@rwandair.com'} },
  { code:'HRE', city:'Harare Robert Mugabe', country:'Zimbabwe', region:'Southern Africa', lat:-17.9318, lng:31.0928, type:'Station',
    revenueTarget:36911, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:39, dwellAlerts:0, revMTD:3076, topRoute:'HRE-KGL',
    contacts:{cargo:'+263 4 575 111', email:'hre.cargo@rwandair.com'} },
  { code:'CPT', city:'Cape Town', country:'South Africa', region:'Southern Africa', lat:-33.9648, lng:18.6017, type:'Codeshare',
    revenueTarget:35000, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:36, dwellAlerts:0, revMTD:2917, topRoute:'CPT-JNB',
    contacts:{cargo:'+27 21 937 1200', email:'cpt.cargo@rwandair.com'} },
  // ── EAST AFRICA ───────────────────────────────────────────────────
  { code:'NBO', city:'Nairobi JKIA', country:'Kenya', region:'East Africa', lat:-1.3192, lng:36.9275, type:'Transit Hub',
    revenueTarget:3351597, capacity:{belly:4500, aircraft:['Q400','B737-800']},
    dwellSLA:36, load:84, dwellAlerts:4, revMTD:279300, topRoute:'NBO-KGL',
    contacts:{cargo:'+254 20 827 4444', email:'nbo.cargo@rwandair.com'} },
  { code:'EBB', city:'Entebbe', country:'Uganda', region:'East Africa', lat:0.0424, lng:32.4435, type:'Key Station',
    revenueTarget:481783, capacity:{belly:4500, aircraft:['B737-800','Q400']},
    dwellSLA:48, load:51, dwellAlerts:0, revMTD:40149, topRoute:'EBB-KGL',
    contacts:{cargo:'+256 41 422 1118', email:'ebb.cargo@rwandair.com'} },
  { code:'DAR', city:'Dar es Salaam Julius Nyerere', country:'Tanzania', region:'East Africa', lat:-6.8781, lng:39.2026, type:'Key Station',
    revenueTarget:60755, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:58, dwellAlerts:2, revMTD:5063, topRoute:'DAR-KGL',
    contacts:{cargo:'+255 22 284 3111', email:'dar.cargo@rwandair.com'} },
  { code:'JRO', city:'Kilimanjaro', country:'Tanzania', region:'East Africa', lat:-3.4294, lng:37.0745, type:'Station',
    revenueTarget:12000, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:34, dwellAlerts:0, revMTD:1000, topRoute:'JRO-DAR',
    contacts:{cargo:'+255 27 255 4252', email:'jro.cargo@rwandair.com'} },
  { code:'ZNZ', city:'Zanzibar', country:'Tanzania', region:'East Africa', lat:-6.2202, lng:39.2248, type:'Station',
    revenueTarget:18000, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:42, dwellAlerts:0, revMTD:1500, topRoute:'ZNZ-MBA',
    contacts:{cargo:'+255 24 223 2130', email:'znz.cargo@rwandair.com'} },
  { code:'MBA', city:'Mombasa Moi', country:'Kenya', region:'East Africa', lat:-4.0348, lng:39.5942, type:'Station',
    revenueTarget:15000, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:47, dwellAlerts:0, revMTD:1250, topRoute:'MBA-ZNZ',
    contacts:{cargo:'+254 41 343 4200', email:'mba.cargo@rwandair.com'} },
  { code:'BJM', city:'Bujumbura', country:'Burundi', region:'East Africa', lat:-3.3224, lng:29.3189, type:'Station',
    revenueTarget:33700, capacity:{belly:4500, aircraft:['Q400','B737-800']},
    dwellSLA:48, load:43, dwellAlerts:0, revMTD:2808, topRoute:'BJM-KGL',
    contacts:{cargo:'+257 22 24 3333', email:'bjm.cargo@rwandair.com'} },
  { code:'KME', city:'Kamembe', country:'Rwanda', region:'East Africa', lat:-2.4626, lng:28.9108, type:'Domestic',
    revenueTarget:8000, capacity:{belly:1500, aircraft:['Q400']},
    dwellSLA:24, load:28, dwellAlerts:0, revMTD:667, topRoute:'KME-KGL',
    contacts:{cargo:'+250 252 537 211', email:'kme.cargo@rwandair.com'} },
  { code:'ADD', city:'Addis Ababa Bole', country:'Ethiopia', region:'East Africa', lat:8.9778, lng:38.7993, type:'Codeshare',
    revenueTarget:45000, capacity:{belly:4500, aircraft:['B737-800']},
    dwellSLA:48, load:41, dwellAlerts:4, revMTD:3750, topRoute:'ADD-KGL',
    contacts:{cargo:'+251 11 665 4444', email:'add.cargo@rwandair.com'} },
];

/** Get station by IATA code */
export function getStation(code) {
  return STATIONS.find(s => s.code === code) || null;
}

/** Get all stations in a region */
export function getStationsByRegion(region) {
  return STATIONS.filter(s => s.region === region);
}

/** Get all stations with active dwell alerts */
export function getAlertStations() {
  return STATIONS.filter(s => s.dwellAlerts > 0);
}

/** Get unique regions */
export const REGIONS = [...new Set(STATIONS.map(s => s.region))];
