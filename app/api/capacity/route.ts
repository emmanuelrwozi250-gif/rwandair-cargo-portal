import { NextResponse } from 'next/server'

// Real W25 freighter schedule (Oct 2025 – Mar 2026) — WB9xxx = dedicated freighter rotations (738F)
// S26 (from Mar 29 2026) adds WB9446 (KGL-EBB-JUB-NBO-KGL) and WB9302 (KGL-DOH-SHJ-JUB-KGL)
const FLIGHTS = [
  {
    id: '1', flightNumber: 'WB9434', route: 'KGL → EBB',
    legs: 'KGL → EBB → KGL',
    departure: new Date(Date.now() + 2 * 3600000).toISOString(),
    aircraft: 'B737-800F', capacityKg: 22000, usedKg: 14300,
    availableKg: 7700, pctUsed: 65,
    commodityRestrictions: ['GENERAL', 'PERISHABLE', 'PHARMACEUTICAL'],
    ratePerKg: 2.80,
    std: '15:00', sta: '18:00',
  },
  {
    id: '2', flightNumber: 'WB9308', route: 'KGL → JIB',
    legs: 'KGL → JIB → SHJ → JUB → KGL',
    departure: new Date(Date.now() + 8 * 3600000).toISOString(),
    aircraft: 'B737-800F', capacityKg: 22000, usedKg: 8800,
    availableKg: 13200, pctUsed: 40,
    commodityRestrictions: ['GENERAL', 'PHARMACEUTICAL', 'HIGH_VALUE'],
    ratePerKg: 4.10,
    std: '23:00', sta: '17:00+2',
  },
  {
    id: '3', flightNumber: 'WB9464', route: 'KGL → EBB',
    legs: 'KGL → EBB → NBO → KGL',
    departure: new Date(Date.now() + 44 * 3600000).toISOString(),
    aircraft: 'B737-800F', capacityKg: 22000, usedKg: 20900,
    availableKg: 1100, pctUsed: 95,
    commodityRestrictions: ['GENERAL', 'PERISHABLE'],
    ratePerKg: 2.80,
    std: '11:30', sta: '18:10',
  },
  {
    id: '4', flightNumber: 'WB9304', route: 'KGL → SHJ',
    legs: 'KGL → SHJ → KGL',
    departure: new Date(Date.now() + 56 * 3600000).toISOString(),
    aircraft: 'B737-800F', capacityKg: 22000, usedKg: 9900,
    availableKg: 12100, pctUsed: 45,
    commodityRestrictions: ['GENERAL', 'PHARMACEUTICAL', 'PERISHABLE', 'HIGH_VALUE'],
    ratePerKg: 4.50,
    std: '23:00', sta: '13:00+1',
  },
  {
    id: '5', flightNumber: 'WB9316', route: 'KGL → JIB',
    legs: 'KGL → JIB → DWC → KGL',
    departure: new Date(Date.now() + 78 * 3600000).toISOString(),
    aircraft: 'B737-800F', capacityKg: 22000, usedKg: 5500,
    availableKg: 16500, pctUsed: 25,
    commodityRestrictions: ['GENERAL', 'PHARMACEUTICAL', 'HIGH_VALUE'],
    ratePerKg: 4.20,
    std: '00:30', sta: '16:40',
  },
]

export async function GET() {
  return NextResponse.json(
    { flights: FLIGHTS },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  )
}
