import { NextRequest, NextResponse } from 'next/server'

const MOCK_DATA: Record<string, object> = {
  '459-40100001': {
    shipment: { awb: '459-40100001', origin: 'KGL', destination: 'AMS', commodity: 'Fresh roses', weightKg: 3000, status: 'IN_TRANSIT', clientId: 'kigali-flowers-ltd', whatsappPhone: '+250788001234' },
    currentLocation: { lat: 15.2, lng: 32.1, altitudeFt: 33000 },
    latestSensors: { tempC: 4.2, humidityPct: 68, shockG: 0, lat: 15.2, lng: 32.1, altitudeFt: 33000, recordedAt: new Date().toISOString() },
    timeline: [
      { stage: 'Collected',       timestamp: new Date(Date.now() - 14 * 3600000).toISOString(), location: 'Kigali Cold-store' },
      { stage: 'Customs cleared', timestamp: new Date(Date.now() - 11 * 3600000).toISOString(), location: 'KGL Customs' },
      { stage: 'Departed',        timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),  location: 'KGL Kigali Intl.' },
      { stage: 'In transit',      timestamp: new Date().toISOString(),                           location: '33,000ft over Sudan' },
    ],
    alerts: [],
    etaMinutes: 180,
    etaConfidence: 0.94,
    whatsappUpdatesActive: true,
  },
  '459-53104200': {
    shipment: { awb: '459-53104200', origin: 'EBB', destination: 'DXB', commodity: 'Fresh seafood', weightKg: 320, status: 'DELAYED', clientId: 'lake-victoria-exports', whatsappPhone: '+256701234567' },
    currentLocation: { lat: -1.97, lng: 30.14, altitudeFt: 0 },
    latestSensors: { tempC: 2.8, humidityPct: 85, shockG: 0.8, lat: -1.97, lng: 30.14, altitudeFt: 0, recordedAt: new Date().toISOString() },
    timeline: [
      { stage: 'Collected',       timestamp: new Date(Date.now() - 18 * 3600000).toISOString(), location: 'Entebbe Port' },
      { stage: 'Customs cleared', timestamp: new Date(Date.now() - 15 * 3600000).toISOString(), location: 'EBB Customs' },
      { stage: 'Departed',        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), location: 'EBB Entebbe Intl.' },
      { stage: 'At hub (delay)',   timestamp: new Date().toISOString(),                          location: 'KGL Hub — awaiting connection' },
    ],
    alerts: [
      {
        type: 'DELAY_RISK',
        message: 'Connecting flight EK-812 delayed 3h. Est. 18% market value loss (~$940) if confirmed.',
        recommendation: 'Reroute via KGL tonight — 4h faster. Alternative space confirmed on WB531.',
        resolved: false,
        sentViaWA: true,
      },
    ],
    etaMinutes: 480,
    etaConfidence: 0.71,
    whatsappUpdatesActive: true,
  },
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ awb: string }> }) {
  const { awb } = await params
  const data = MOCK_DATA[awb]

  if (!data) {
    // Return a generic in-transit record for any unknown AWB
    return NextResponse.json({
      shipment: { awb, origin: 'KGL', destination: 'LHR', status: 'IN_TRANSIT', weightKg: 1000 },
      currentLocation: { lat: 15, lng: 30, altitudeFt: 35000 },
      latestSensors: { tempC: 4.5, humidityPct: 65, shockG: 0, altitudeFt: 35000, recordedAt: new Date().toISOString() },
      timeline: [{ stage: 'In transit', timestamp: new Date().toISOString(), location: 'En route' }],
      alerts: [],
      etaMinutes: 240,
      etaConfidence: 0.88,
      whatsappUpdatesActive: false,
    })
  }

  return NextResponse.json(data)
}
