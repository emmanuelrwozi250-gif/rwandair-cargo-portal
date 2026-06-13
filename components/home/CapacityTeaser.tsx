'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane, ChevronRight } from 'lucide-react'

interface Flight {
  id: string
  flightNumber: string
  route: string
  legs: string
  departure: string
  availableKg: number
  pctUsed: number
  ratePerKg: number
  std: string
}

// Homepage capacity teaser (Feature 5d): top 3 upcoming flights with space,
// refreshed every 90s like /capacity. Renders nothing when no data.
export default function CapacityTeaser() {
  const [flights, setFlights] = useState<Flight[]>([])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const res = await fetch('/api/capacity')
        const data = await res.json()
        if (!active) return
        const upcoming = ((data.flights ?? []) as Flight[])
          .filter(f => f.availableKg > 0)
          .sort((a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime())
          .slice(0, 3)
        setFlights(upcoming)
      } catch {
        if (active) setFlights([])
      }
    }
    load()
    const timer = setInterval(load, 90_000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  if (!flights.length) return null

  return (
    <section className="py-16" style={{ background: 'var(--wb-gray-50)' }} aria-label="Available capacity">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <p className="label-upper mb-2" style={{ color: 'var(--wb-sky)' }}>Live from the freighter network</p>
            <h2 style={{ color: 'var(--wb-blue)' }}>Available space — right now</h2>
          </div>
          <Link href="/capacity" className="inline-flex items-center gap-1 text-sm font-bold"
                style={{ color: 'var(--wb-sky)' }}>
            View all available capacity <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {flights.map(f => {
            const departure = new Date(f.departure)
            const hoursOut = Math.max(0, Math.round((departure.getTime() - Date.now()) / 3600_000))
            return (
              <Link key={f.id} href="/capacity"
                    className="rounded-2xl p-6 card-lift block"
                    style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 font-mono font-bold text-sm"
                        style={{ color: 'var(--wb-blue)' }}>
                    <Plane className="w-4 h-4" style={{ color: 'var(--wb-sky)' }} aria-hidden="true" />
                    {f.flightNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--wb-yellow-light)', color: 'var(--wb-gray-900)' }}>
                    {hoursOut <= 12 ? `departs in ${hoursOut}h` : `STD ${f.std}`}
                  </span>
                </div>
                <p className="font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>{f.route}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--wb-gray-500)' }}>{f.legs}</p>

                {/* Load bar */}
                <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'var(--wb-gray-200)' }}
                     role="img" aria-label={`${f.pctUsed}% of capacity sold`}>
                  <div className="h-full rounded-full"
                       style={{
                         width: `${f.pctUsed}%`,
                         background: f.pctUsed > 85 ? '#dc2626' : f.pctUsed > 60 ? '#f59e0b' : 'var(--wb-green)',
                       }} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>
                    {f.availableKg.toLocaleString()} kg free
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--wb-sky)' }}>
                    from ${f.ratePerKg.toFixed(2)}/kg
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
