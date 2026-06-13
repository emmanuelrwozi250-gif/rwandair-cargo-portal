'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import type { Profile } from '@/types'

const TOGGLES: { key: 'notify_departure' | 'notify_arrival' | 'notify_exception'; label: string; desc: string }[] = [
  { key: 'notify_departure', label: 'Email on departure', desc: 'When a booking departs its origin' },
  { key: 'notify_arrival',   label: 'Email on arrival',   desc: 'When cargo arrives at destination' },
  { key: 'notify_exception', label: 'Email on exception', desc: 'Delays, holds, or routing changes' },
]

export default function NotificationPrefs({ profile }: { profile: Profile }) {
  const [prefs, setPrefs] = useState({
    notify_departure: profile.notify_departure,
    notify_arrival: profile.notify_arrival,
    notify_exception: profile.notify_exception,
    whatsapp_number: profile.whatsapp_number ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/portal/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error || 'Save failed') }
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      <h2 className="font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>Notification preferences</h2>
      <div className="space-y-3">
        {TOGGLES.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--wb-blue)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{desc}</p>
            </div>
            <button type="button" role="switch" aria-checked={prefs[key]} aria-label={label}
                    onClick={() => { setPrefs(p => ({ ...p, [key]: !p[key] })); setSaved(false) }}
                    className="relative shrink-0 rounded-full transition-colors"
                    style={{ width: 44, height: 26, background: prefs[key] ? 'var(--wb-green)' : 'var(--wb-gray-200)' }}>
              <span className="absolute top-1 rounded-full bg-white transition-all" style={{ width: 18, height: 18, left: prefs[key] ? 22 : 4 }} aria-hidden="true" />
            </button>
          </div>
        ))}

        <div className="pt-2">
          <label htmlFor="wa" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
            WhatsApp number <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(for instant alerts)</span>
          </label>
          <input id="wa" type="tel" value={prefs.whatsapp_number}
                 onChange={e => { setPrefs(p => ({ ...p, whatsapp_number: e.target.value })); setSaved(false) }}
                 placeholder="+250 7XX XXX XXX"
                 className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                 style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
        </div>
      </div>

      {error && <p role="alert" className="text-xs mt-3" style={{ color: '#dc2626' }}>{error}</p>}

      <div className="flex items-center gap-3 mt-5">
        <button onClick={save} disabled={busy}
                className="px-6 py-2.5 rounded-full font-bold text-sm transition-opacity"
                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
          {busy ? 'Saving…' : 'Save preferences'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: '#4a7c20' }}>
            <Check className="w-4 h-4" aria-hidden="true" /> Saved
          </span>
        )}
      </div>
    </div>
  )
}
