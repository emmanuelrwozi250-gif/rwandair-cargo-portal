// RwandAir cargo network airport coordinates [lng, lat] for the tracker map.
export const AIRPORT_COORDS: Record<string, [number, number]> = {
  KGL: [30.1395, -1.9686],  EBB: [32.4435, 0.0424],   NBO: [36.9278, -1.3192],
  DAR: [39.2026, -6.8781],  JIB: [43.1595, 11.5473],  ADD: [38.7993, 8.9779],
  JNB: [28.2460, -26.1392], CPT: [18.6017, -33.9690], HRE: [31.0928, -17.9319],
  LUN: [28.4526, -15.3308], LOS: [3.3212, 6.5774],    ABV: [7.2632, 9.0068],
  ACC: [-0.1668, 5.6052],   ABJ: [-3.9263, 5.2614],   DLA: [9.7195, 4.0061],
  FIH: [15.4446, -4.3858],  GOM: [29.2385, -1.6708],  BJM: [29.3185, -3.3240],
  DSS: [-17.0733, 14.6710], LBV: [9.4123, 0.4586],    TNR: [47.4789, -18.7969],
  MRU: [57.6836, -20.4302], LHR: [-0.4543, 51.4700],  CDG: [2.5479, 49.0097],
  BRU: [4.4844, 50.9014],   AMS: [4.7639, 52.3105],   DXB: [55.3644, 25.2532],
  DWC: [55.1614, 24.8966],  SHJ: [55.5172, 25.3286],  DOH: [51.6081, 25.2731],
  TLV: [34.8854, 32.0114],  BOM: [72.8679, 19.0896],  CAN: [113.2988, 23.3924],
  JFK: [-73.7781, 40.6413], MBA: [39.5942, -4.0348],  ZNZ: [39.2249, -6.2220],
}

const toRad = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

// Great-circle interpolation → array of [lng,lat] points for a smooth arc.
export function greatCirclePoints(
  from: [number, number],
  to: [number, number],
  steps = 64
): [number, number][] {
  const [lng1, lat1] = [toRad(from[0]), toRad(from[1])]
  const [lng2, lat2] = [toRad(to[0]), toRad(to[1])]
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((lat2 - lat1) / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2
  ))
  if (d === 0) return [from, to]
  const pts: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2)
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2)
    const z = A * Math.sin(lat1) + B * Math.sin(lat2)
    pts.push([toDeg(Math.atan2(y, x)), toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)))])
  }
  return pts
}

// Point at fraction f (0..1) along a polyline, plus heading to the next point.
export function pointAlong(points: [number, number][], f: number): { pos: [number, number]; bearing: number } {
  if (points.length < 2) return { pos: points[0] ?? [0, 0], bearing: 0 }
  const idx = Math.min(points.length - 2, Math.max(0, Math.floor(f * (points.length - 1))))
  const a = points[idx], b = points[idx + 1]
  const bearing = toDeg(Math.atan2(b[0] - a[0], b[1] - a[1]))
  return { pos: a, bearing }
}
