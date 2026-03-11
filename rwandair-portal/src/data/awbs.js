/* ============================================================
   RwandAir Cargo Intelligence Portal — AWB Mock Data
   20 Air Waybills with full tracking timelines
   ============================================================ */

export const AWB_DATA = [
  {
    awb: '459-11223344',
    origin: 'LOS', destination: 'LHR',
    shipper: 'Dangote Industries Ltd', consignee: 'UK Import Co Ltd',
    weight: 340, volume: 2.1, commodity: 'General Cargo',
    status: 'In Transit', flight: 'WB101',
    rate: 3.85, totalCharge: 1309,
    specialHandling: null,
    bookedDate: '2026-03-08',
    timeline: [
      { stage: 'Booked',          time: '2026-03-08T08:15:00Z', location: 'LOS', handler: 'Cargo Africa Ltd', weight: 340, note: 'Booking confirmed — AWB issued' },
      { stage: 'Accepted',        time: '2026-03-08T18:30:00Z', location: 'LOS', handler: 'Cargo Africa Ltd', weight: 340, note: 'Cargo accepted at LOS warehouse, screened' },
      { stage: 'ULD Build-up',    time: '2026-03-08T21:00:00Z', location: 'LOS', handler: 'FAAN Ground Ops',  weight: 340, note: 'Built into PMC-12341-WB pallet' },
      { stage: 'Uplifted',        time: '2026-03-08T22:30:00Z', location: 'WB101', handler: 'WB Ramp LOS',    weight: 340, note: 'Departed LOS on WB101' },
      { stage: 'In Transit',      time: '2026-03-09T06:45:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 340, note: 'Arrived NBO — transit warehouse' },
      { stage: 'Connecting',      time: '2026-03-09T09:15:00Z', location: 'WB204', handler: 'WB Ramp NBO',    weight: 340, note: 'Loaded onto WB204 NBO-LHR' },
    ]
  },
  {
    awb: '459-22334455',
    origin: 'NBO', destination: 'CDG',
    shipper: 'East Africa Fresh Ltd', consignee: 'Paris Marché SA',
    weight: 820, volume: 5.4, commodity: 'Perishables',
    status: 'Delivered', flight: 'WB204',
    rate: 4.10, totalCharge: 3362,
    specialHandling: 'COL',
    bookedDate: '2026-03-05',
    timeline: [
      { stage: 'Booked',          time: '2026-03-05T10:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 820, note: 'Booking confirmed — perishable COL' },
      { stage: 'Accepted',        time: '2026-03-05T16:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 820, note: 'Fresh produce accepted, cool room confirmed' },
      { stage: 'ULD Build-up',    time: '2026-03-05T20:00:00Z', location: 'NBO', handler: 'KQ Ground Ops',    weight: 820, note: 'Built into temperature-controlled ULD' },
      { stage: 'Uplifted',        time: '2026-03-05T22:40:00Z', location: 'WB204', handler: 'WB Ramp NBO',    weight: 820, note: 'Departed NBO on WB204 non-stop to CDG' },
      { stage: 'Arrived Transit Hub', time: '2026-03-06T07:30:00Z', location: 'CDG', handler: 'Air France Ground', weight: 820, note: 'Arrived CDG, customs pre-alerted' },
      { stage: 'Customs Clearance', time: '2026-03-06T10:00:00Z', location: 'CDG', handler: 'French Customs', weight: 820, note: 'Cleared customs — perishable priority lane' },
      { stage: 'Out for Delivery', time: '2026-03-06T12:30:00Z', location: 'CDG', handler: 'DHL France',      weight: 820, note: 'Handed to final mile courier' },
      { stage: 'Delivered',       time: '2026-03-06T16:45:00Z', location: 'CDG', handler: 'Paris Marché SA',  weight: 820, note: 'Delivered — recipient signed' },
    ]
  },
  {
    awb: '459-33445566',
    origin: 'JNB', destination: 'AMS',
    shipper: 'SA Exporters Pty Ltd', consignee: 'Rotterdam Trading BV',
    weight: 560, volume: 3.8, commodity: 'Automotive Parts',
    status: 'Customs Clearance', flight: 'WB312',
    rate: 4.20, totalCharge: 2352,
    specialHandling: null,
    bookedDate: '2026-03-09',
    timeline: [
      { stage: 'Booked',          time: '2026-03-09T09:00:00Z', location: 'JNB', handler: 'Southern Air Services', weight: 560, note: 'Booking confirmed via EDI' },
      { stage: 'Accepted',        time: '2026-03-09T15:00:00Z', location: 'JNB', handler: 'Southern Air Services', weight: 560, note: 'Cargo accepted and screened' },
      { stage: 'ULD Build-up',    time: '2026-03-09T21:30:00Z', location: 'JNB', handler: 'ACSA Ops',         weight: 560, note: 'Built into PMC-77441-WB' },
      { stage: 'Uplifted',        time: '2026-03-09T23:10:00Z', location: 'WB312', handler: 'WB Ramp JNB',    weight: 560, note: 'Departed JNB on WB312' },
      { stage: 'In Transit',      time: '2026-03-10T08:20:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 560, note: 'Arrived NBO transit' },
      { stage: 'Connecting',      time: '2026-03-10T11:00:00Z', location: 'WB408', handler: 'WB Ramp NBO',    weight: 560, note: 'Loaded WB408 NBO-AMS' },
      { stage: 'Arrived Transit Hub', time: '2026-03-11T06:30:00Z', location: 'AMS', handler: 'Schiphol Ops', weight: 560, note: 'Arrived AMS' },
      { stage: 'Customs Clearance', time: '2026-03-11T08:00:00Z', location: 'AMS', handler: 'Dutch Customs',  weight: 560, note: 'Customs review in progress' },
    ]
  },
  {
    awb: '459-44556677',
    origin: 'KGL', destination: 'DXB',
    shipper: 'RwandAir Cargo Direct', consignee: 'Dubai Free Zone LLC',
    weight: 210, volume: 1.2, commodity: 'Electronics',
    status: 'In Transit', flight: 'WB622',
    rate: 3.65, totalCharge: 766.5,
    specialHandling: null,
    bookedDate: '2026-03-10',
    timeline: [
      { stage: 'Booked',          time: '2026-03-10T07:00:00Z', location: 'KGL', handler: 'RwandAir Direct',  weight: 210, note: 'Booking confirmed' },
      { stage: 'Accepted',        time: '2026-03-10T14:00:00Z', location: 'KGL', handler: 'RwandAir Direct',  weight: 210, note: 'Electronics screened, CAO declared' },
      { stage: 'Uplifted',        time: '2026-03-10T22:30:00Z', location: 'WB101', handler: 'WB Ramp KGL',    weight: 210, note: 'Uplift on WB101 KGL-NBO segment' },
      { stage: 'In Transit',      time: '2026-03-11T02:15:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 210, note: 'Arrived NBO, connecting to WB622 tonight' },
    ]
  },
  {
    awb: '459-55667788',
    origin: 'ADD', destination: 'LHR',
    shipper: 'Ethiopian Textile Export', consignee: 'London Fashion House',
    weight: 1200, volume: 8.1, commodity: 'Garments',
    status: 'In Transit', flight: 'WB516',
    rate: 2.90, totalCharge: 3480,
    specialHandling: null,
    bookedDate: '2026-03-07',
    timeline: [
      { stage: 'Booked',          time: '2026-03-07T11:00:00Z', location: 'ADD', handler: 'Horn of Africa Cargo', weight: 1200, note: 'Booking confirmed — large shipment' },
      { stage: 'Accepted',        time: '2026-03-07T18:00:00Z', location: 'ADD', handler: 'Horn of Africa Cargo', weight: 1200, note: 'Garments screened and wrapped' },
      { stage: 'ULD Build-up',    time: '2026-03-07T22:00:00Z', location: 'ADD', handler: 'Ethiopian Airlines Ground', weight: 1200, note: 'Built on PMC pallets x3' },
      { stage: 'Uplifted',        time: '2026-03-08T01:30:00Z', location: 'WB516', handler: 'WB Ramp ADD',     weight: 1200, note: 'Departed ADD' },
      { stage: 'In Transit',      time: '2026-03-08T06:15:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 1200, note: 'Arrived NBO, transfer pending' },
    ]
  },
  {
    awb: '459-66778899',
    origin: 'CPT', destination: 'CDG',
    shipper: 'Cape Fine Wines Export', consignee: 'Le Vignoble Paris',
    weight: 480, volume: 2.9, commodity: 'Perishables',
    status: 'Delivered', flight: 'WB900',
    rate: 4.35, totalCharge: 2088,
    specialHandling: 'COL',
    bookedDate: '2026-03-04',
    timeline: [
      { stage: 'Booked',          time: '2026-03-04T09:00:00Z', location: 'CPT', handler: 'Cape Cargo Intl',   weight: 480, note: 'Booking confirmed' },
      { stage: 'Accepted',        time: '2026-03-04T16:00:00Z', location: 'CPT', handler: 'Cape Cargo Intl',   weight: 480, note: 'Wines screened, COL documentation complete' },
      { stage: 'Uplifted',        time: '2026-03-04T20:00:00Z', location: 'WB900', handler: 'WB Ramp CPT',     weight: 480, note: 'Departed CPT' },
      { stage: 'In Transit',      time: '2026-03-05T05:30:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 480, note: 'Arrived NBO transit' },
      { stage: 'Connecting',      time: '2026-03-05T09:15:00Z', location: 'WB204', handler: 'WB Ramp NBO',     weight: 480, note: 'Loaded WB204' },
      { stage: 'Arrived Transit Hub', time: '2026-03-05T16:30:00Z', location: 'CDG', handler: 'CDG Ops',      weight: 480, note: 'Arrived CDG' },
      { stage: 'Customs Clearance', time: '2026-03-05T19:00:00Z', location: 'CDG', handler: 'French Customs',  weight: 480, note: 'Cleared — food/beverage lane' },
      { stage: 'Out for Delivery', time: '2026-03-06T08:00:00Z', location: 'CDG', handler: 'DHL France',       weight: 480, note: 'Out for delivery' },
      { stage: 'Delivered',       time: '2026-03-06T11:30:00Z', location: 'Paris', handler: 'Le Vignoble Paris', weight: 480, note: 'Delivered — signed by consignee' },
    ]
  },
  {
    awb: '459-77889900',
    origin: 'DAR', destination: 'LHR',
    shipper: 'Tanzania Gold Exporters', consignee: 'London Metals Co',
    weight: 95, volume: 0.3, commodity: 'Valuables',
    status: 'In Transit', flight: 'WB622',
    rate: 3.75, totalCharge: 356.25,
    specialHandling: 'VAL',
    bookedDate: '2026-03-10',
    timeline: [
      { stage: 'Booked',          time: '2026-03-10T06:00:00Z', location: 'DAR', handler: 'Dar Freight Solutions', weight: 95, note: 'Valuables booking confirmed' },
      { stage: 'Accepted',        time: '2026-03-10T13:00:00Z', location: 'DAR', handler: 'Dar Freight Solutions', weight: 95, note: 'Accepted under secure hold VAL protocol' },
      { stage: 'Uplifted',        time: '2026-03-10T18:30:00Z', location: 'WB622', handler: 'WB Ramp DAR',     weight: 95, note: 'Loaded into secure belly VAL compartment' },
      { stage: 'In Transit',      time: '2026-03-11T01:15:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 95, note: 'Arrived NBO — stored in VAL secure room' },
    ]
  },
  {
    awb: '459-88990011',
    origin: 'LOS', destination: 'DXB',
    shipper: 'PharmaCorp Nigeria Ltd', consignee: 'Gulf Medical Supplies',
    weight: 150, volume: 0.9, commodity: 'Pharma',
    status: 'Booked', flight: 'WB101',
    rate: 3.50, totalCharge: 525,
    specialHandling: 'PIL',
    bookedDate: '2026-03-11',
    timeline: [
      { stage: 'Booked',          time: '2026-03-11T08:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 150, note: 'PIL booking confirmed — 2-8C required' },
    ]
  },
  {
    awb: '459-99001122',
    origin: 'NBO', destination: 'LHR',
    shipper: 'Nairobi Tech Exports', consignee: 'London Electronics Ltd',
    weight: 380, volume: 2.5, commodity: 'Electronics',
    status: 'On Hold', flight: 'WB204',
    rate: 4.10, totalCharge: 1558,
    specialHandling: null,
    bookedDate: '2026-03-09',
    timeline: [
      { stage: 'Booked',          time: '2026-03-09T10:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 380, note: 'Booking confirmed' },
      { stage: 'Accepted',        time: '2026-03-09T17:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 380, note: 'Accepted — documentation review initiated' },
    ]
  },
  {
    awb: '459-10112233',
    origin: 'EBB', destination: 'LHR',
    shipper: 'Uganda Coffee Board', consignee: 'London Coffee Exchange',
    weight: 720, volume: 4.2, commodity: 'Perishables',
    status: 'In Transit', flight: 'WB516',
    rate: 3.60, totalCharge: 2592,
    specialHandling: 'COL',
    bookedDate: '2026-03-10',
    timeline: [
      { stage: 'Booked',          time: '2026-03-10T08:00:00Z', location: 'EBB', handler: 'Uganda Air Cargo',  weight: 720, note: 'Coffee shipment — COL documentation' },
      { stage: 'Accepted',        time: '2026-03-10T15:00:00Z', location: 'EBB', handler: 'Uganda Air Cargo',  weight: 720, note: 'Accepted, cool room confirmed EBB' },
      { stage: 'Uplifted',        time: '2026-03-10T21:30:00Z', location: 'WB516', handler: 'WB Ramp EBB',     weight: 720, note: 'Departed EBB on WB516' },
      { stage: 'In Transit',      time: '2026-03-11T01:30:00Z', location: 'KGL', handler: 'RwandAir Ground',   weight: 720, note: 'Arrived KGL transit hub' },
    ]
  },
  {
    awb: '459-20213141',
    origin: 'LOS', destination: 'LHR',
    shipper: 'West Africa Motors', consignee: 'British Auto Parts Ltd',
    weight: 1650, volume: 9.8, commodity: 'Automotive Parts',
    status: 'Delivered', flight: 'WB101',
    rate: 3.85, totalCharge: 6352.5,
    specialHandling: null,
    bookedDate: '2026-03-01',
    timeline: [
      { stage: 'Booked',          time: '2026-03-01T09:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 1650, note: 'Large shipment booking' },
      { stage: 'Accepted',        time: '2026-03-01T17:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 1650, note: 'Accepted and screened' },
      { stage: 'ULD Build-up',    time: '2026-03-01T21:00:00Z', location: 'LOS', handler: 'FAAN Ground Ops',  weight: 1650, note: 'Built onto PMC pallets x4' },
      { stage: 'Uplifted',        time: '2026-03-01T22:30:00Z', location: 'WB101', handler: 'WB Ramp LOS',    weight: 1650, note: 'Departed LOS' },
      { stage: 'In Transit',      time: '2026-03-02T06:45:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 1650, note: 'Transit NBO' },
      { stage: 'Connecting',      time: '2026-03-02T09:15:00Z', location: 'WB204', handler: 'WB Ramp NBO',    weight: 1650, note: 'WB204 NBO-LHR' },
      { stage: 'Arrived Transit Hub', time: '2026-03-02T14:40:00Z', location: 'LHR', handler: 'LHR Ops',     weight: 1650, note: 'Arrived LHR' },
      { stage: 'Customs Clearance', time: '2026-03-02T17:00:00Z', location: 'LHR', handler: 'HMRC',          weight: 1650, note: 'Cleared customs' },
      { stage: 'Out for Delivery', time: '2026-03-03T08:00:00Z', location: 'LHR', handler: 'DHL UK',          weight: 1650, note: 'Out for delivery' },
      { stage: 'Delivered',       time: '2026-03-03T14:00:00Z', location: 'Birmingham', handler: 'British Auto Parts', weight: 1650, note: 'Delivered in full' },
    ]
  },
  {
    awb: '459-31324151',
    origin: 'NBO', destination: 'DXB',
    shipper: 'Kenya Floriculture Board', consignee: 'Dubai Flowers Market',
    weight: 890, volume: 5.9, commodity: 'Perishables',
    status: 'In Transit', flight: 'WB622',
    rate: 3.50, totalCharge: 3115,
    specialHandling: 'COL',
    bookedDate: '2026-03-11',
    timeline: [
      { stage: 'Booked',          time: '2026-03-11T04:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 890, note: 'Fresh flowers — COL urgent' },
      { stage: 'Accepted',        time: '2026-03-11T09:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 890, note: 'Accepted, cool room at 4C confirmed' },
    ]
  },
  {
    awb: '459-41526374',
    origin: 'JNB', destination: 'CDG',
    shipper: 'Southern Mining Corp', consignee: 'Antwerp Diamond Centre',
    weight: 42, volume: 0.1, commodity: 'Valuables',
    status: 'Delivered', flight: 'WB312',
    rate: 4.20, totalCharge: 176.4,
    specialHandling: 'VAL',
    bookedDate: '2026-03-08',
    timeline: [
      { stage: 'Booked',          time: '2026-03-08T07:00:00Z', location: 'JNB', handler: 'Southern Air Services', weight: 42, note: 'Precious stones VAL protocol' },
      { stage: 'Accepted',        time: '2026-03-08T13:00:00Z', location: 'JNB', handler: 'Southern Air Services', weight: 42, note: 'Secure acceptance complete, armed escort' },
      { stage: 'Uplifted',        time: '2026-03-08T23:10:00Z', location: 'WB312', handler: 'WB Ramp JNB',    weight: 42, note: 'Secure belly compartment' },
      { stage: 'In Transit',      time: '2026-03-09T08:20:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 42, note: 'Transit NBO secure room' },
      { stage: 'Connecting',      time: '2026-03-09T11:00:00Z', location: 'WB408', handler: 'WB Ramp NBO',    weight: 42, note: 'WB408 NBO-AMS-CDG' },
      { stage: 'Arrived Transit Hub', time: '2026-03-10T07:00:00Z', location: 'CDG', handler: 'CDG VAL Ops', weight: 42, note: 'Secure unloading CDG' },
      { stage: 'Customs Clearance', time: '2026-03-10T09:30:00Z', location: 'CDG', handler: 'Douanes FR',    weight: 42, note: 'Cleared — precious stones permit verified' },
      { stage: 'Out for Delivery', time: '2026-03-10T11:00:00Z', location: 'CDG', handler: 'Brinks France',  weight: 42, note: 'Secure courier' },
      { stage: 'Delivered',       time: '2026-03-10T15:00:00Z', location: 'Antwerp', handler: 'Antwerp Diamond', weight: 42, note: 'Signed delivery complete' },
    ]
  },
  {
    awb: '459-51627384',
    origin: 'KGL', destination: 'LHR',
    shipper: 'Rwanda Tea Board', consignee: 'Tesco PLC UK',
    weight: 2400, volume: 14.0, commodity: 'Perishables',
    status: 'Booked', flight: 'WB204',
    rate: 3.65, totalCharge: 8760,
    specialHandling: null,
    bookedDate: '2026-03-11',
    timeline: [
      { stage: 'Booked',          time: '2026-03-11T10:00:00Z', location: 'KGL', handler: 'RwandAir Direct',  weight: 2400, note: 'Large tea shipment — pickup 12 Mar' },
    ]
  },
  {
    awb: '459-61728394',
    origin: 'LOS', destination: 'CDG',
    shipper: 'Lagos Frozen Foods', consignee: 'Carrefour France',
    weight: 1100, volume: 7.2, commodity: 'Perishables',
    status: 'On Hold', flight: 'WB312',
    rate: 3.90, totalCharge: 4290,
    specialHandling: 'COL',
    bookedDate: '2026-03-10',
    timeline: [
      { stage: 'Booked',          time: '2026-03-10T12:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 1100, note: 'Frozen goods booking' },
      { stage: 'Accepted',        time: '2026-03-10T16:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 1100, note: 'Accepted — customs documentation pending review' },
    ]
  },
  {
    awb: '459-71829304',
    origin: 'ADD', destination: 'DXB',
    shipper: 'Addis Fashion House', consignee: 'Dubai Mall Fashion',
    weight: 630, volume: 4.5, commodity: 'Garments',
    status: 'In Transit', flight: 'WB516',
    rate: 2.90, totalCharge: 1827,
    specialHandling: null,
    bookedDate: '2026-03-09',
    timeline: [
      { stage: 'Booked',          time: '2026-03-09T08:00:00Z', location: 'ADD', handler: 'Horn of Africa Cargo', weight: 630, note: 'Garments booking' },
      { stage: 'Accepted',        time: '2026-03-09T16:30:00Z', location: 'ADD', handler: 'Horn of Africa Cargo', weight: 630, note: 'Accepted and wrapped' },
      { stage: 'Uplifted',        time: '2026-03-09T20:00:00Z', location: 'WB516', handler: 'WB Ramp ADD',     weight: 630, note: 'Departed ADD on WB516' },
      { stage: 'In Transit',      time: '2026-03-10T02:30:00Z', location: 'KGL', handler: 'RwandAir Ground',   weight: 630, note: 'Transit KGL 2.5hrs' },
      { stage: 'Connecting',      time: '2026-03-10T05:00:00Z', location: 'WB622', handler: 'WB Ramp KGL',    weight: 630, note: 'WB622 KGL-DXB' },
    ]
  },
  {
    awb: '459-81930405',
    origin: 'DAR', destination: 'CDG',
    shipper: 'Tanzania Tobacco Board', consignee: 'Marlboro France',
    weight: 2100, volume: 12.0, commodity: 'General Cargo',
    status: 'In Transit', flight: 'WB622',
    rate: 3.75, totalCharge: 7875,
    specialHandling: null,
    bookedDate: '2026-03-09',
    timeline: [
      { stage: 'Booked',          time: '2026-03-09T09:00:00Z', location: 'DAR', handler: 'Dar Freight Solutions', weight: 2100, note: 'Tobacco leaf booking — import permit provided' },
      { stage: 'Accepted',        time: '2026-03-09T16:00:00Z', location: 'DAR', handler: 'Dar Freight Solutions', weight: 2100, note: 'Screened and accepted' },
      { stage: 'Uplifted',        time: '2026-03-09T18:30:00Z', location: 'WB622', handler: 'WB Ramp DAR',     weight: 2100, note: 'Departed DAR' },
      { stage: 'In Transit',      time: '2026-03-10T01:15:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 2100, note: 'Transit NBO' },
    ]
  },
  {
    awb: '459-92031516',
    origin: 'NBO', destination: 'LHR',
    shipper: 'East Africa Pharma Ltd', consignee: 'NHS Supply Chain UK',
    weight: 85, volume: 0.5, commodity: 'Pharma',
    status: 'Delivered', flight: 'WB204',
    rate: 4.10, totalCharge: 348.5,
    specialHandling: 'PIL',
    bookedDate: '2026-03-06',
    timeline: [
      { stage: 'Booked',          time: '2026-03-06T07:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 85, note: 'NHS medical supplies — PIL 2-8C' },
      { stage: 'Accepted',        time: '2026-03-06T14:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 85, note: 'Cool room acceptance complete, 4C confirmed' },
      { stage: 'ULD Build-up',    time: '2026-03-06T20:00:00Z', location: 'NBO', handler: 'KQ Ground Ops',    weight: 85, note: 'Temp ULD build-up' },
      { stage: 'Uplifted',        time: '2026-03-06T22:40:00Z', location: 'WB204', handler: 'WB Ramp NBO',    weight: 85, note: 'Uplift on WB204' },
      { stage: 'Arrived Transit Hub', time: '2026-03-07T05:30:00Z', location: 'LHR', handler: 'LHR Pharma',  weight: 85, note: 'Arrived LHR, priority lane' },
      { stage: 'Customs Clearance', time: '2026-03-07T07:00:00Z', location: 'LHR', handler: 'HMRC Pharma',   weight: 85, note: 'Cleared — medical goods priority' },
      { stage: 'Out for Delivery', time: '2026-03-07T09:00:00Z', location: 'LHR', handler: 'NHS Logistics',  weight: 85, note: 'NHS vehicle dispatched' },
      { stage: 'Delivered',       time: '2026-03-07T12:30:00Z', location: 'London', handler: 'NHS Supply',  weight: 85, note: 'Delivered to NHS depot, signed' },
    ]
  },
  {
    awb: '459-03142627',
    origin: 'LOS', destination: 'LHR',
    shipper: 'Access Bank Nigeria', consignee: 'Lloyds Bank London',
    weight: 12, volume: 0.05, commodity: 'Valuables',
    status: 'In Transit', flight: 'WB101',
    rate: 3.85, totalCharge: 46.2,
    specialHandling: 'VAL',
    bookedDate: '2026-03-11',
    timeline: [
      { stage: 'Booked',          time: '2026-03-11T06:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 12, note: 'Banking documents — high security' },
      { stage: 'Accepted',        time: '2026-03-11T12:00:00Z', location: 'LOS', handler: 'Cargo Africa Ltd',  weight: 12, note: 'Accepted under VAL secure protocol' },
    ]
  },
  {
    awb: '459-14253748',
    origin: 'KGL', destination: 'CDG',
    shipper: 'RwandAir Direct Cargo', consignee: 'Air France Cargo CDG',
    weight: 3200, volume: 20.0, commodity: 'General Cargo',
    status: 'In Transit', flight: 'WB204',
    rate: 3.65, totalCharge: 11680,
    specialHandling: null,
    bookedDate: '2026-03-10',
    timeline: [
      { stage: 'Booked',          time: '2026-03-10T09:00:00Z', location: 'KGL', handler: 'RwandAir Direct',  weight: 3200, note: 'Large charter equivalent — mixed cargo' },
      { stage: 'Accepted',        time: '2026-03-10T15:00:00Z', location: 'KGL', handler: 'RwandAir Direct',  weight: 3200, note: 'Full acceptance — ULD configuration finalised' },
      { stage: 'ULD Build-up',    time: '2026-03-10T21:00:00Z', location: 'KGL', handler: 'RwandAir Ground',  weight: 3200, note: 'Built on 7 PMC pallets' },
      { stage: 'Uplifted',        time: '2026-03-10T22:30:00Z', location: 'WB204', handler: 'WB Ramp KGL',    weight: 3200, note: 'Departed KGL-NBO segment on WB204' },
      { stage: 'In Transit',      time: '2026-03-11T02:00:00Z', location: 'NBO', handler: 'East Africa Cargo', weight: 3200, note: 'Transit NBO — ramp transfer to WB312' },
    ]
  }
];

/* 6 AWBs configured to return full tracking results in the tracking page */
export const TRACKABLE_AWBS = [
  '459-11223344',
  '459-22334455',
  '459-33445566',
  '459-44556677',
  '459-55667788',
  '459-66778899'
];
