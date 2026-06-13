'use client'

import { useState } from 'react'
import { track } from '@vercel/analytics'
import { Zap, CheckCircle } from 'lucide-react'
import { PRODUCT_TYPES, validateIataFiata } from '@/lib/portal-constants'

const VOLUME_OPTIONS = ['Under 1 tonne/month', '1–5 tonnes/month', '5–20 tonnes/month', '20t+ /month']
const PRODUCT_LABELS: Record<string, string> = {
  General: 'General', Fresh: 'Fresh', Pharma: 'Pharma', Valuables: 'Valuables', DG: 'Dangerous Goods', Live: 'Live Animals',
}
const HEAR_ABOUT_OPTIONS = [
  'cargo.one / WebCargo / CargoAi', 'Industry colleague', 'RwandAir passenger network',
  'Trade event or conference', 'Search engine', 'Social media / LinkedIn', 'Other',
]
const ROUTE_OPTIONS = [
  'KGL → LHR (London)', 'KGL → CDG/BRU (Paris/Brussels)', 'KGL → AMS (Amsterdam)',
  'KGL → DXB/DWC (Dubai)', 'KGL → SHJ (Sharjah freighter)', 'KGL → JIB (Djibouti freighter)',
  'KGL → NBO (Nairobi)', 'KGL → EBB (Entebbe)', 'KGL → LOS (Lagos)', 'KGL → JNB (Johannesburg)',
  'Intra-Africa other', 'Transit via KGL hub',
]

export default function AgentRegisterForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '', iata: '', contact: '', email: '', phone: '', country: '', volume: '', hearAbout: '',
  })
  const [routes, setRoutes] = useState<string[]>([])
  const [products, setProducts] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.company.trim()) e.company = 'Company name is required'
    if (!form.contact.trim()) e.contact = 'Contact name is required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.country.trim()) e.country = 'Country is required'
    if (form.iata.trim() && !validateIataFiata(form.iata)) e.iata = 'Enter a valid IATA (7 digits) or FIATA code'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/agents/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, routes, products }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Request failed (${res.status})`)
      }
      track('agent_application', { volume: form.volume || 'unspecified' })
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (id: keyof typeof form, label: string, placeholder: string, required = true) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
        {label}{required && <span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input
        id={id}
        type={id === 'email' ? 'email' : 'text'}
        value={form[id]}
        onChange={e => { setForm(f => ({ ...f, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: '' })) }}
        placeholder={placeholder}
        aria-required={required}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-err` : undefined}
        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
        style={{
          border: errors[id] ? '1.5px solid #dc2626' : '1.5px solid var(--wb-gray-200)',
          color: 'var(--wb-blue)',
          background: 'white',
        }}
      />
      {errors[id] && (
        <p id={`${id}-err`} role="alert" className="text-xs mt-1" style={{ color: '#dc2626' }}>{errors[id]}</p>
      )}
    </div>
  )

  const select = (id: keyof typeof form, label: string, options: string[]) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
        {label}
      </label>
      <select id={id} value={form[id]}
              onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none"
              style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  if (submitted) {
    return (
      <div className="text-center py-12 rounded-2xl"
           style={{ background: 'rgba(45,125,70,0.07)', border: '1px solid rgba(45,125,70,0.2)' }}>
        <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#94C944' }} aria-hidden="true" />
        <h3 className="font-bold mb-2" style={{ color: 'var(--wb-blue)' }}>Application received</h3>
        <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
          Our commercial team will contact you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <>
      {submitError && (
        <div role="alert" className="rounded-lg p-3 text-sm mb-4"
             style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {field('company', 'Company name', 'e.g. East Africa Freight Ltd')}
        {field('iata', 'IATA / FIATA code (if applicable)', 'e.g. 1234567 or FIATA code', false)}
        {field('contact', 'Contact name', 'Full name')}
        {field('email', 'Email address', 'you@company.com')}
        {field('phone', 'Phone number', '+250 7XX XXX XXX')}
        {field('country', 'Country', 'e.g. Kenya')}
        {select('volume', 'Estimated monthly volume', VOLUME_OPTIONS)}

        <fieldset>
          <legend className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
            Preferred product types <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(select all that apply)</span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {PRODUCT_TYPES.map(p => {
              const on = products.includes(p)
              return (
                <button key={p} type="button" aria-pressed={on}
                        onClick={() => setProducts(cur => on ? cur.filter(x => x !== p) : [...cur, p])}
                        className="text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                        style={on
                          ? { background: 'var(--wb-sky-light)', border: '1.5px solid var(--wb-sky)', color: 'var(--wb-blue)' }
                          : { background: 'white', border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
                  {on ? '✓ ' : ''}{PRODUCT_LABELS[p] ?? p}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
            Primary routes <span className="font-normal text-xs" style={{ color: 'var(--wb-gray-500)' }}>(select all that apply)</span>
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {ROUTE_OPTIONS.map(r => {
              const on = routes.includes(r)
              return (
                <button key={r} type="button" aria-pressed={on}
                        onClick={() => setRoutes(cur => on ? cur.filter(x => x !== r) : [...cur, r])}
                        className="text-left text-xs font-semibold px-3 py-2.5 rounded-lg transition-colors"
                        style={on
                          ? { background: 'var(--wb-sky-light)', border: '1.5px solid var(--wb-sky)', color: 'var(--wb-blue)' }
                          : { background: 'white', border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)' }}>
                  {on ? '✓ ' : ''}{r}
                </button>
              )
            })}
          </div>
        </fieldset>

        {select('hearAbout', 'How did you hear about us?', HEAR_ABOUT_OPTIONS)}

        <button type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm transition-opacity"
                style={{ background: 'var(--wb-yellow)', color: 'var(--brand-blue)', padding: '14px 28px', borderRadius: '8px', opacity: submitting ? 0.7 : 1 }}>
          <Zap className="w-4 h-4" aria-hidden="true" />
          {submitting ? 'Submitting…' : 'Apply for agent account'}
        </button>
        <p className="text-xs text-center" style={{ color: 'var(--wb-gray-500)' }}>
          Or email us directly at{' '}
          <a href="mailto:cargobooking@rwandair.com" style={{ color: 'var(--wb-sky)' }}>
            cargobooking@rwandair.com
          </a>
        </p>
      </form>
    </>
  )
}
