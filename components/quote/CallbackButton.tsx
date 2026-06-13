'use client'

import { useState } from 'react'
import { Phone, X, CheckCircle } from 'lucide-react'

// "Request callback" for shipments outside standard self-serve parameters.
export default function CallbackButton({ context, reason }: { context?: string; reason?: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/quote/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, context }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not send your request.')
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="rounded-xl p-5 flex flex-wrap items-center justify-between gap-4"
           style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(251,225,21,0.5)' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>
            {reason ? 'This shipment needs a human touch' : 'Need something non-standard?'}
          </p>
          <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
            {reason ?? 'Oversized, special handling, or an off-schedule route — our cargo desk will call you back.'}
          </p>
        </div>
        <button onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shrink-0"
                style={{ background: 'var(--wb-blue)', color: 'white' }}>
          <Phone className="w-4 h-4" aria-hidden="true" /> Request a callback
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Request a callback">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-2xl p-6 sm:p-8" style={{ background: 'white' }}>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" style={{ color: 'var(--wb-gray-500)' }} aria-hidden="true" />
            </button>
            {done ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
                <h2 className="font-bold mb-2" style={{ color: 'var(--wb-blue)' }}>Request received</h2>
                <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>Our cargo desk will call you back within 2 business hours.</p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>Request a callback</h2>
                <form onSubmit={submit} className="space-y-3">
                  {(['name', 'email', 'phone'] as const).map(f => (
                    <div key={f}>
                      <label htmlFor={`cb-${f}`} className="block text-sm font-semibold mb-1 capitalize" style={{ color: 'var(--wb-blue)' }}>{f}</label>
                      <input id={`cb-${f}`} type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} required
                             value={form[f]} onChange={e => setForm(s => ({ ...s, [f]: e.target.value }))}
                             className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="cb-note" className="block text-sm font-semibold mb-1" style={{ color: 'var(--wb-blue)' }}>Notes <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(optional)</span></label>
                    <textarea id="cb-note" rows={3} value={form.note} onChange={e => setForm(s => ({ ...s, note: e.target.value }))}
                              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-y"
                              style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
                  </div>
                  {error && <p role="alert" className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
                  <button type="submit" disabled={busy}
                          className="w-full py-3 rounded-full font-bold text-sm transition-opacity"
                          style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
                    {busy ? 'Sending…' : 'Request callback'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
