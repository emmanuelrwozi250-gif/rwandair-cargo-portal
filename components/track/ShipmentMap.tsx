'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { AIRPORT_COORDS, greatCirclePoints, pointAlong } from '@/lib/airports'
import { Plane } from 'lucide-react'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

function dot(color: string) {
  const el = document.createElement('div')
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)`
  return el
}
function planeEl(bearing: number) {
  const el = document.createElement('div')
  el.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="#00529C" style="transform:rotate(${bearing}deg);filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))"><path d="M22 16v-2l-8.5-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z"/></svg>`
  return el
}

export default function ShipmentMap({
  origin, destination, fraction,
}: { origin: string; destination: string; fraction: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const from = AIRPORT_COORDS[origin]
  const to = AIRPORT_COORDS[destination]
  const haveCoords = !!from && !!to

  useEffect(() => {
    if (!TOKEN || !haveCoords || !ref.current) return
    mapboxgl.accessToken = TOKEN

    const arc = greatCirclePoints(from!, to!)
    const { pos, bearing } = pointAlong(arc, fraction)

    const map = new mapboxgl.Map({
      container: ref.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds: [
        [Math.min(from![0], to![0]), Math.min(from![1], to![1])],
        [Math.max(from![0], to![0]), Math.max(from![1], to![1])],
      ],
      fitBoundsOptions: { padding: 70 },
      cooperativeGestures: true,
    })
    mapRef.current = map

    map.on('load', () => {
      map.addSource('arc', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: arc } } })
      map.addLayer({
        id: 'arc', type: 'line', source: 'arc',
        layout: { 'line-cap': 'round' },
        paint: { 'line-color': '#00529C', 'line-width': 2.5, 'line-dasharray': [1, 1.5] },
      })
      new mapboxgl.Marker({ element: dot('#16A1DC') }).setLngLat(from!).setPopup(new mapboxgl.Popup({ offset: 12 }).setText(origin)).addTo(map)
      new mapboxgl.Marker({ element: dot('#FBE115') }).setLngLat(to!).setPopup(new mapboxgl.Popup({ offset: 12 }).setText(destination)).addTo(map)
      new mapboxgl.Marker({ element: planeEl(bearing), rotationAlignment: 'map' }).setLngLat(pos).addTo(map)
    })

    return () => { map.remove(); mapRef.current = null }
  }, [origin, destination, fraction, from, to, haveCoords])

  // Fallback: no token or unknown airport → static arc illustration.
  if (!TOKEN || !haveCoords) {
    return (
      <div className="relative w-full h-full rounded-2xl flex flex-col items-center justify-center text-center p-8"
           style={{ background: 'linear-gradient(135deg,#e4f5fc,#f8f9fa)', border: '1px solid var(--wb-gray-200)' }}>
        <svg viewBox="0 0 300 140" className="w-full max-w-md mb-4" aria-hidden="true">
          <path d="M40 110 Q150 10 260 110" fill="none" stroke="#00529C" strokeWidth="2.5" strokeDasharray="4 4" />
          <circle cx="40" cy="110" r="6" fill="#16A1DC" stroke="#fff" strokeWidth="2" />
          <circle cx="260" cy="110" r="6" fill="#FBE115" stroke="#fff" strokeWidth="2" />
          <g transform={`translate(${40 + 220 * Math.min(1, Math.max(0, fraction))}, ${110 - 100 * Math.sin(Math.PI * Math.min(1, Math.max(0, fraction)))})`}>
            <path d="M-9 0 L9 0 M0 -6 L0 6" stroke="#00529C" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
        <div className="flex items-center gap-6 text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>
          <span>{origin}</span><Plane className="w-4 h-4" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" /><span>{destination}</span>
        </div>
        <p className="text-xs mt-4 max-w-sm" style={{ color: 'var(--wb-gray-500)' }}>
          {!TOKEN
            ? 'Interactive map loads once a Mapbox token is configured. Position shown is indicative.'
            : 'Map coordinates aren\'t on file for this route yet — position shown is indicative.'}
        </p>
      </div>
    )
  }

  return <div ref={ref} className="w-full h-full rounded-2xl overflow-hidden" style={{ border: '1px solid var(--wb-gray-200)' }} />
}
