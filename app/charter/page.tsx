'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Plane, CheckCircle, X } from 'lucide-react'

const ORIGINS = ['KGL', 'EBB', 'NBO', 'DAR', 'LOS', 'JNB', 'ADD']
const CARGO_TYPES = ['General', 'Perishables', 'Pharmaceuticals', 'Dangerous Goods', 'Live Animals', 'Valuables', 'Oversized / Project', 'Humanitarian / Aid']

export default function CharterPage() {
  const [form, setForm] = useState({
    origin: 'KGL', destination: '', cargoType: '', description: '',
    weight: '', volume: '', dateRange: '', name: '', company: '', email: '', phone: '', requirements: '',
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form, v: string) => { setForm(f => ({ ...f, [k]: v })); setError('') }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/charter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Could not send your request.')
      track('charter_request', { origin: form.origin })
      setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally { setBusy(false) }
  }

  const inputStyle = { border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' } as const
  const label = (text: string, req = false) => (
    <span className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
      {text}{req && <span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>}
    </span>
  )

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Charter</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              Charter the whole aircraft
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '560px' }}>
              Your route, your timing — up to 22,000 kg of African cargo moving on your terms.
              Tell us what you need and our charter team responds within 2 business days.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {done ? (
            <div className="rounded-2xl p-10 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <CheckCircle className="w-14 h-14 mx-auto mb-5" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
              <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>Charter request received</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                Thank you. Our charter team will review your requirements and respond within
                <strong> 2 business days</strong>. A confirmation is on its way to your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="rounded-2xl p-6 sm:p-8 space-y-5"
                  style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="origin">{label('Origin airport', true)}</label>
                  <select id="origin" value={form.origin} onChange={e => set('origin', e.target.value)}
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle}>
                    {ORIGINS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="destination">{label('Destination', true)}</label>
                  <input id="destination" value={form.destination} onChange={e => set('destination', e.target.value)}
                         placeholder="Airport or city" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </div>

              <div>
                <label htmlFor="cargoType">{label('Cargo type', true)}</label>
                <select id="cargoType" value={form.cargoType} onChange={e => set('cargoType', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle}>
                  <option value="">Select…</option>
                  {CARGO_TYPES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="description">{label('Cargo description')}</label>
                <textarea id="description" rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                          placeholder="What are you moving?" className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y" style={inputStyle} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="weight">{label('Est. weight (kg)')}</label>
                  <input id="weight" type="number" min="0" value={form.weight} onChange={e => set('weight', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="volume">{label('Est. volume (CBM)')}</label>
                  <input id="volume" type="number" min="0" value={form.volume} onChange={e => set('volume', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="dateRange">{label('Preferred dates')}</label>
                  <input id="dateRange" value={form.dateRange} onChange={e => set('dateRange', e.target.value)}
                         placeholder="e.g. 10–15 Jul" className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name">{label('Full name', true)}</label>
                  <input id="name" autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="company">{label('Company')}</label>
                  <input id="company" autoComplete="organization" value={form.company} onChange={e => set('company', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="email">{label('Email', true)}</label>
                  <input id="email" type="email" autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="phone">{label('Phone', true)}</label>
                  <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                         className="w-full px-4 py-3 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              </div>

              <div>
                <label htmlFor="requirements">{label('Special requirements')}</label>
                <textarea id="requirements" rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)}
                          placeholder="Temperature control, AOG, security escort, permits…"
                          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y" style={inputStyle} />
              </div>

              {error && (
                <div role="alert" className="rounded-lg p-3 text-sm flex items-start gap-2"
                     style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
                  <X className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /> {error}
                </div>
              )}

              <button type="submit" disabled={busy}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm transition-opacity"
                      style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
                <Plane className="w-4 h-4" aria-hidden="true" /> {busy ? 'Sending…' : 'Request a charter quote'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
