'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { track } from '@vercel/analytics'
import { Zap } from 'lucide-react'

// RwandAir cargo network stations for origin/destination autocomplete
export const WB_STATIONS = [
  'KGL — Kigali', 'EBB — Entebbe', 'NBO — Nairobi', 'DAR — Dar es Salaam', 'JIB — Djibouti',
  'ADD — Addis Ababa', 'JNB — Johannesburg', 'CPT — Cape Town', 'HRE — Harare', 'LUN — Lusaka',
  'LOS — Lagos', 'ABV — Abuja', 'ACC — Accra', 'ABJ — Abidjan', 'DLA — Douala', 'BZV — Brazzaville',
  'FIH — Kinshasa', 'GOM — Goma', 'BJM — Bujumbura', 'LFW — Lomé', 'CKY — Conakry', 'DSS — Dakar',
  'BGF — Bangui', 'LBV — Libreville', 'TNR — Antananarivo', 'MRU — Mauritius', 'EBL — Zanzibar',
  'LHR — London Heathrow', 'CDG — Paris', 'BRU — Brussels', 'AMS — Amsterdam',
  'DXB — Dubai', 'DWC — Dubai Al Maktoum', 'SHJ — Sharjah', 'DOH — Doha', 'TLV — Tel Aviv',
  'BOM — Mumbai', 'CAN — Guangzhou', 'JFK — New York',
]

function toCode(value: string): string {
  return value.trim().slice(0, 3).toUpperCase()
}

// Inline 3-field quote form for the homepage hero (Feature 5b) —
// hands off to /quote?from=&to=&weight= which pre-populates the full engine.
export default function HeroQuoteWidget() {
  const router = useRouter()
  const [from, setFrom] = useState('KGL — Kigali')
  const [to, setTo] = useState('')
  const [weight, setWeight] = useState('')
  const [error, setError] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const fromCode = toCode(from)
    const toCodeV = toCode(to)
    const w = Number(weight)
    if (fromCode.length !== 3 || toCodeV.length !== 3) {
      setError('Please choose an origin and destination airport.')
      return
    }
    if (!Number.isFinite(w) || w < 1 || w > 20000) {
      setError('Weight must be between 1 and 20,000 kg.')
      return
    }
    track('hero_quote', { from: fromCode, to: toCodeV })
    router.push(`/quote?from=${fromCode}&to=${toCodeV}&weight=${Math.round(w)}`)
  }

  const fieldStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.97)',
    border: 'none',
    color: 'var(--brand-blue)',
  }

  return (
    <form onSubmit={submit} aria-label="Get an instant quote"
          className="rounded-2xl p-4 sm:p-5 max-w-xl"
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div>
          <label htmlFor="hq-from" className="block text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            From
          </label>
          <input id="hq-from" list="wb-stations" value={from}
                 onChange={e => { setFrom(e.target.value); setError('') }}
                 placeholder="KGL — Kigali"
                 autoComplete="off"
                 className="w-full px-3.5 py-3 rounded-lg text-sm font-semibold outline-none"
                 style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="hq-to" className="block text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            To
          </label>
          <input id="hq-to" list="wb-stations" value={to}
                 onChange={e => { setTo(e.target.value); setError('') }}
                 placeholder="LHR — London"
                 autoComplete="off"
                 className="w-full px-3.5 py-3 rounded-lg text-sm font-semibold outline-none"
                 style={fieldStyle} />
        </div>
        <div>
          <label htmlFor="hq-weight" className="block text-xs font-bold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Weight (kg)
          </label>
          <input id="hq-weight" type="number" min={1} max={20000} value={weight}
                 onChange={e => { setWeight(e.target.value); setError('') }}
                 placeholder="500"
                 className="w-full px-3.5 py-3 rounded-lg text-sm font-semibold outline-none"
                 style={fieldStyle} />
        </div>
      </div>
      <datalist id="wb-stations">
        {WB_STATIONS.map(s => <option key={s} value={s} />)}
      </datalist>

      {error && (
        <p role="alert" className="text-xs font-semibold mt-2" style={{ color: '#FCD34D' }}>{error}</p>
      )}

      <button type="submit"
              className="w-full sm:w-auto mt-3 inline-flex items-center justify-center gap-2 font-bold text-sm transition-all hover:opacity-90"
              style={{ background: 'var(--wb-yellow)', color: 'var(--brand-blue)', padding: '13px 28px', borderRadius: '8px' }}>
        <Zap className="w-4 h-4" aria-hidden="true" /> Get instant quote
      </button>
      <p className="text-xs mt-2.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
        Get 3 routing options in under 30 seconds
      </p>
    </form>
  )
}
