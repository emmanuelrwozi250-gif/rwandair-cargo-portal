'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import { CheckCircle } from 'lucide-react'

// 0–10 NPS selector with red→green colour grading, follow-up reason box,
// and no-reload submit. Used on /feedback and inside the global drawer.
export default function NpsPulse({ source = 'page', compact = false }: { source?: 'page' | 'drawer'; compact?: boolean }) {
  const [score, setScore] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (score === null) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, reason: reason.trim() || undefined, source }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Could not record your response.')
      }
      track('nps_submitted', { score, source })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div role="status" className="flex items-center gap-3 rounded-xl px-5 py-4"
           style={{ background: 'var(--wb-green-light)', border: '1px solid rgba(148,201,67,0.4)' }}>
        <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#4a7c20' }} aria-hidden="true" />
        <p className="text-sm font-semibold" style={{ color: '#4a7c20' }}>
          Thank you — your feedback makes us better.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p id={`nps-label-${source}`} className={`font-bold mb-3 ${compact ? 'text-sm' : 'text-base'}`}
         style={{ color: 'var(--wb-blue)' }}>
        How likely are you to recommend RwandAir Cargo to a colleague?
      </p>

      <div role="radiogroup" aria-labelledby={`nps-label-${source}`}
           className="grid grid-cols-11 gap-1 sm:gap-1.5 mb-2">
        {Array.from({ length: 11 }, (_, n) => {
          const active = score === n
          // 0 = red (hue 0) → 10 = green (hue 120)
          const hue = n * 12
          return (
            <button key={n} type="button" role="radio" aria-checked={active}
                    aria-label={`${n} out of 10`}
                    onClick={() => setScore(n)}
                    className="flex items-center justify-center rounded-lg font-bold transition-all"
                    style={{
                      minHeight: compact ? 38 : 48,
                      fontSize: compact ? 13 : 15,
                      background: active ? `hsl(${hue}, 65%, 42%)` : `hsl(${hue}, 60%, 94%)`,
                      color: active ? 'white' : `hsl(${hue}, 65%, 32%)`,
                      border: `1.5px solid hsl(${hue}, 55%, ${active ? 42 : 80}%)`,
                      transform: active ? 'scale(1.08)' : 'none',
                    }}>
              {n}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-xs mb-4" style={{ color: 'var(--wb-gray-500)' }} aria-hidden="true">
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>

      {score !== null && (
        <div>
          <label htmlFor={`nps-reason-${source}`} className="block text-sm font-semibold mb-1.5"
                 style={{ color: 'var(--wb-blue)' }}>
            What&apos;s the main reason for your score?
          </label>
          <textarea id={`nps-reason-${source}`} rows={compact ? 2 : 3} value={reason}
                    onChange={e => setReason(e.target.value)}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y"
                    style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }} />
          {error && <p role="alert" className="text-xs mt-1" style={{ color: '#dc2626' }}>{error}</p>}
          <button type="button" onClick={submit} disabled={busy}
                  className="mt-3 px-6 py-2.5 rounded-full font-bold text-sm transition-opacity"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}
    </div>
  )
}
