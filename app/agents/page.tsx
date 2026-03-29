'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Zap, Globe2, Phone, CheckCircle, ChevronRight, Users, CreditCard, Headphones } from 'lucide-react'

export default function AgentsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    company: '', iata: '', contact: '', email: '', phone: '', country: '', volume: '',
  })
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
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Request failed (${res.status})`)
      }
      setSubmitted(true)
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

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        {/* Hero */}
        <div className="py-20" style={{
          backgroundImage: "linear-gradient(rgba(7,24,48,0.88), rgba(10,31,68,0.84)), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&q=80&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          backgroundColor: '#0A1F44',
        }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Freight Agents &amp; Forwarders</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,56px)', fontWeight: 800, lineHeight: 1.05 }}>
              The preferred cargo partner<br />for African freight forwarders
            </h1>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: '560px' }}>
              Credit accounts, platform integrations, and a dedicated agent support line —
              purpose-built for professional intermediaries moving cargo through Kigali Hub.
            </p>
            <a href="#register"
               className="inline-flex items-center gap-2 font-bold text-sm"
               style={{ background: 'var(--wb-yellow)', color: '#0A1F44', padding: '14px 28px', borderRadius: '8px' }}>
              <Zap className="w-4 h-4" /> Register your agency
            </a>
          </div>
        </div>

        {/* Benefits */}
        <section className="py-16" style={{ background: 'white' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Why RwandAir Cargo</p>
              <h2 style={{ color: 'var(--wb-blue)' }}>Built for professionals</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: CreditCard,
                  title: 'Credit account eligibility',
                  color: '#00529C', bg: 'rgba(4,84,155,0.07)',
                  points: [
                    '30-day credit terms for approved agents',
                    'Consolidated monthly invoicing',
                    'No per-booking payment friction',
                  ],
                },
                {
                  icon: Globe2,
                  title: 'Platform integrations',
                  color: '#94C944', bg: 'rgba(45,125,70,0.08)',
                  points: [
                    'Live on cargo.one, WebCargo, CargoAi',
                    'Flexport, Freightos & CargoWise',
                    'Direct REST API available',
                  ],
                },
                {
                  icon: Headphones,
                  title: 'Dedicated agent support',
                  color: '#16A1DC', bg: 'rgba(28,163,219,0.08)',
                  points: [
                    'Named account manager for volume agents',
                    '24/7 agent-priority cargo desk',
                    'WhatsApp booking & status updates',
                  ],
                },
              ].map(({ icon: Icon, title, color, bg, points }) => (
                <div key={title} className="rounded-2xl p-7"
                     style={{ background: 'var(--neutral-light)', border: '1px solid var(--wb-gray-200)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                       style={{ background: bg }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-bold mb-3" style={{ color: 'var(--wb-blue)' }}>{title}</h3>
                  <ul className="space-y-2">
                    {points.map(p => (
                      <li key={p} className="flex gap-2 text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16" style={{ background: 'var(--neutral-light)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Process</p>
              <h2 style={{ color: 'var(--wb-blue)' }}>How it works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Register interest', desc: 'Complete the form below with your agency details and estimated monthly volume.' },
                { step: '02', title: 'Account review', desc: 'Our commercial team reviews your application within 2 business days and contacts you to discuss terms.' },
                { step: '03', title: 'Start booking', desc: 'Access platform integrations, your account manager, and preferential rates immediately.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm"
                       style={{ background: 'var(--wb-blue)' }}>
                    {step}
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>{title}</h3>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration form */}
        <section id="register" className="py-16" style={{ background: 'white' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 style={{ color: 'var(--wb-blue)' }}>Register your agency</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--wb-gray-500)' }}>
                Takes 2 minutes. Our commercial team will follow up within 2 business days.
              </p>
            </div>

            {submitted ? (
              <div className="text-center py-12 rounded-2xl"
                   style={{ background: 'rgba(45,125,70,0.07)', border: '1px solid rgba(45,125,70,0.2)' }}>
                <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#94C944' }} />
                <h3 className="font-bold mb-2" style={{ color: 'var(--wb-blue)' }}>Application submitted</h3>
                <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>We&apos;ll be in touch within 2 business days.</p>
              </div>
            ) : (
              <>
              {submitError && (
                <div className="rounded-lg p-3 text-sm mb-4"
                     style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {field('company', 'Company name', 'e.g. East Africa Freight Ltd')}
                {field('iata', 'IATA / FIATA code (optional)', 'e.g. 12345678', false)}
                {field('contact', 'Contact name', 'Full name')}
                {field('email', 'Email address', 'you@company.com')}
                {field('phone', 'Phone number', '+250 7XX XXX XXX')}
                {field('country', 'Country', 'e.g. Kenya')}
                <div>
                  <label htmlFor="volume" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
                    Monthly volume estimate
                  </label>
                  <select
                    id="volume"
                    value={form.volume}
                    onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                    style={{ border: '1.5px solid var(--wb-gray-200)', color: 'var(--wb-blue)', background: 'white' }}
                  >
                    <option value="">Select range</option>
                    <option>Under 1 tonne/month</option>
                    <option>1–5 tonnes/month</option>
                    <option>5–20 tonnes/month</option>
                    <option>20–100 tonnes/month</option>
                    <option>Over 100 tonnes/month</option>
                  </select>
                </div>
                <button type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 font-bold text-sm transition-opacity"
                        style={{ background: 'var(--wb-yellow)', color: '#0A1F44', padding: '14px 28px', borderRadius: '8px', opacity: submitting ? 0.7 : 1 }}>
                  <Zap className="w-4 h-4" />
                  {submitting ? 'Submitting…' : 'Submit registration'}
                </button>
                <p className="text-xs text-center" style={{ color: 'var(--wb-gray-500)' }}>
                  Or email us directly at{' '}
                  <a href="mailto:cargobooking@rwandair.com" style={{ color: 'var(--wb-sky)' }}>
                    cargobooking@rwandair.com
                  </a>
                </p>
              </form>
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
