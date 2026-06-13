'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { generateAwbPdf } from '@/lib/portal-pdf'
import type { Eawb } from '@/types'

const SPECIAL_CODES = ['PER', 'COL', 'PHA', 'AVI', 'VAL', 'DGR', 'EAT', 'HUM']

export default function AwbForm({ companyName }: { companyName: string }) {
  const [form, setForm] = useState({
    shipperName: '', shipperAddress: '', consigneeName: '', consigneeAddress: '',
    commodity: '', pieces: '', weightKg: '', dimensions: '',
  })
  const [special, setSpecial] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<Eawb | null>(null)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/portal/awb', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipper: { name: form.shipperName, address: form.shipperAddress },
          consignee: { name: form.consigneeName, address: form.consigneeAddress },
          commodity: form.commodity,
          pieces: Number(form.pieces) || null,
          weightKg: Number(form.weightKg) || null,
          dimensions: form.dimensions,
          specialHandling: special,
        }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Could not generate AWB')
      setCreated(d.awb as Eawb)
      generateAwbPdf(d.awb as Eawb, companyName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setBusy(false) }
  }

  const input = (k: keyof typeof form, label: string, required = true, type = 'text') => (
    <div>
      <label htmlFor={k} className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
        {label}{required && <span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input id={k} type={type} required={required} value={form[k]} onChange={e => set(k, e.target.value)}
             className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
             style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }} />
    </div>
  )

  if (created) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
        <h2 className="font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>AWB generated</h2>
        <p className="font-mono font-bold text-lg mb-1" style={{ color: 'var(--wb-blue)' }}>{created.awb_number}</p>
        <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)' }}>Your PDF has downloaded. It's also saved against your account.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => generateAwbPdf(created, companyName)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
                  style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-sky)' }}>
            <Download className="w-4 h-4" aria-hidden="true" /> Download again
          </button>
          <button onClick={() => { setCreated(null); setForm({ shipperName: '', shipperAddress: '', consigneeName: '', consigneeAddress: '', commodity: '', pieces: '', weightKg: '', dimensions: '' }); setSpecial([]) }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
            <FileText className="w-4 h-4" aria-hidden="true" /> New AWB
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl p-6 space-y-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input('shipperName', 'Shipper name')}
        {input('consigneeName', 'Consignee name')}
        {input('shipperAddress', 'Shipper address', false)}
        {input('consigneeAddress', 'Consignee address', false)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {input('commodity', 'Commodity')}
        {input('dimensions', 'Dimensions (L×W×H cm)', false)}
        {input('pieces', 'Pieces', false, 'number')}
        {input('weightKg', 'Gross weight (kg)', false, 'number')}
      </div>
      <fieldset>
        <legend className="block text-sm font-semibold mb-2" style={{ color: 'var(--wb-blue)' }}>Special handling codes</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIAL_CODES.map(c => {
            const on = special.includes(c)
            return (
              <button key={c} type="button" aria-pressed={on}
                      onClick={() => setSpecial(s => on ? s.filter(x => x !== c) : [...s, c])}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
                      style={on ? { background: 'var(--wb-blue)', color: 'white' } : { background: 'var(--wb-gray-50)', color: 'var(--wb-blue)', border: '1px solid var(--wb-gray-200)' }}>
                {c}
              </button>
            )
          })}
        </div>
      </fieldset>
      {error && <p role="alert" className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      <button type="submit" disabled={busy}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-opacity"
              style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: busy ? 0.7 : 1 }}>
        <FileText className="w-4 h-4" aria-hidden="true" /> {busy ? 'Generating…' : 'Generate eAWB (459) + PDF'}
      </button>
    </form>
  )
}
