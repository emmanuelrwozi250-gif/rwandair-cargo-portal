'use client'

import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
  PackageX, PackageOpen, Clock, PackageMinus, ShieldAlert,
  CheckCircle, ChevronDown, ChevronRight, Upload, X, Search, FileText,
} from 'lucide-react'
import { checkClaimTimeLimit, CLAIM_TIME_LIMITS, CLAIM_FILE_LIMITS, MONTREAL_CONVENTION_NOTE } from '@/lib/claims'
import { AWB_REGEX } from '@/lib/public-forms'
import type { ClaimType, ClaimStatus } from '@/types'

// ─── Claim type cards ─────────────────────────────────────────────────────────
const CLAIM_TYPES: { type: ClaimType; icon: typeof PackageX; label: string; desc: string }[] = [
  { type: 'Loss',      icon: PackageX,     label: 'Loss',      desc: 'Cargo has not arrived' },
  { type: 'Damage',    icon: PackageOpen,  label: 'Damage',    desc: 'Cargo arrived damaged' },
  { type: 'Delay',     icon: Clock,        label: 'Delay',     desc: 'Arrived outside the agreed SLA' },
  { type: 'Shortage',  icon: PackageMinus, label: 'Shortage',  desc: 'Part of the shipment is missing' },
  { type: 'Pilferage', icon: ShieldAlert,  label: 'Pilferage', desc: 'Tampering is suspected' },
]

const COUNTRY_CODES = [
  '+250 Rwanda', '+254 Kenya', '+256 Uganda', '+255 Tanzania', '+257 Burundi',
  '+243 DR Congo', '+234 Nigeria', '+27 South Africa', '+971 UAE', '+44 UK',
  '+33 France', '+32 Belgium', '+31 Netherlands', '+1 USA/Canada', '+86 China', '+91 India',
]

const FAQS = [
  {
    q: 'What documents do I need?',
    a: 'The more you can provide, the faster we can resolve your claim: the air waybill, commercial invoice, packing list, delivery receipt (with any noted irregularities), and photos of damage where applicable. You can upload up to 5 files (PDF, JPG, PNG — max 5 MB each).',
  },
  {
    q: 'How long does a claim take?',
    a: 'You will receive an acknowledgement from our cargo desk within 72 hours, and we aim to resolve claims within 30 days. Complex claims involving multiple carriers can take longer — we will keep you informed at every stage.',
  },
  {
    q: 'What is the Montreal Convention limit?',
    a: 'For international air cargo, carrier liability is limited under Article 22(3) of the Montreal Convention 1999 — currently 26 Special Drawing Rights (SDR) per kilogramme — unless a higher value was declared for carriage and any supplementary charges paid. The SDR is an IMF currency basket; current rates are published by the IMF.',
  },
  {
    q: 'Can I track my claim status?',
    a: 'Yes. Every claim receives a reference number (WB-CLM-YYYYMMDD-XXXX). Use the "Check claim status" tab on this page to see where your claim is — Received, Under Review, Resolved, or Rejected — with a full timeline.',
  },
]

const STATUS_COLORS: Record<ClaimStatus, { color: string; bg: string }> = {
  'Received':     { color: '#00529C', bg: 'rgba(0,82,156,0.08)' },
  'Under Review': { color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
  'Resolved':     { color: '#4a7c20', bg: 'rgba(148,201,67,0.15)' },
  'Rejected':     { color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
}

// ─── Shared field styling (matches /agents form conventions) ──────────────────
const inputStyle = (hasError: boolean): React.CSSProperties => ({
  border: hasError ? '1.5px solid #dc2626' : '1.5px solid var(--wb-gray-200)',
  color: 'var(--wb-blue)',
  background: 'white',
})

export default function ClaimsPage() {
  const [tab, setTab] = useState<'file' | 'status'>('file')

  // form state
  const [claimType, setClaimType] = useState<ClaimType | null>(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    awb: '', flightNumber: '', origin: '', destination: '', deliveryDate: '', declaredValue: '',
    description: '', claimValue: '', goodCondition: false,
    claimantName: '', claimantCompany: '', claimantEmail: '', countryCode: '+250 Rwanda', phoneNumber: '',
    relationship: '', preferredContact: 'email',
  })
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [result, setResult] = useState<{ claimRef: string; timeLimitWarning: string | null } | null>(null)
  const [awbLookupDone, setAwbLookupDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // status lookup state
  const [lookupRef, setLookupRef] = useState('')
  const [lookupBusy, setLookupBusy] = useState(false)
  const [lookupError, setLookupError] = useState('')
  const [lookupResult, setLookupResult] = useState<{
    claimRef: string; claimType: string; status: ClaimStatus; awb: string; createdAt: string
    timeline: { status: ClaimStatus; note?: string; created_at: string }[]
  } | null>(null)

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // ?ref=WB-CLM-… deep link opens the status tab pre-filled
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) {
      setLookupRef(ref)
      setTab('status')
    }
  }, [])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const normalizedAwb = (() => {
    const cleaned = form.awb.trim().replace(/\s+/g, '')
    return /^\d{11}$/.test(cleaned) ? `${cleaned.slice(0, 3)}-${cleaned.slice(3)}` : cleaned
  })()
  const awbValid = AWB_REGEX.test(normalizedAwb)

  // Live time-limit assessment as soon as type + delivery date are known
  const timeCheck =
    claimType && form.deliveryDate ? checkClaimTimeLimit(claimType, form.deliveryDate) : null

  // Auto-populate flight/route details from the tracking system when the AWB is valid
  useEffect(() => {
    if (!awbValid || awbLookupDone) return
    let cancelled = false
    fetch(`/api/track/${normalizedAwb}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data?.shipment) return
        setForm(f => ({
          ...f,
          origin: f.origin || data.shipment.origin || '',
          destination: f.destination || data.shipment.destination || '',
        }))
        setAwbLookupDone(true)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [awbValid, normalizedAwb, awbLookupDone])

  // ── Per-step validation — no silent failures ───────────────────────────────
  function validateStep(s: number): boolean {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!awbValid) e.awb = 'Please enter a valid AWB number (e.g. 459-12345678)'
      if (!form.deliveryDate) e.deliveryDate = 'Please select the actual (or expected) delivery date'
      if ((claimType === 'Loss' || claimType === 'Damage') && !form.declaredValue)
        e.declaredValue = 'Declared value is required for loss and damage claims'
    }
    if (s === 2) {
      if (form.description.trim().length < 50)
        e.description = `Please describe what happened in at least 50 characters (currently ${form.description.trim().length})`
      if (!form.goodCondition)
        e.goodCondition = 'Please confirm the goods were handed to RwandAir in good condition'
    }
    if (s === 3) {
      if (!form.claimantName.trim()) e.claimantName = 'Your full name is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.claimantEmail)) e.claimantEmail = 'A valid email is required'
      if (!form.phoneNumber.trim()) e.phoneNumber = 'Your phone number is required'
      if (!form.relationship) e.relationship = 'Please select your relationship to the shipment'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const next = [...files]
    const problems: string[] = []
    for (const f of incoming) {
      if (next.length >= CLAIM_FILE_LIMITS.maxFiles) { problems.push(`Maximum ${CLAIM_FILE_LIMITS.maxFiles} files`); break }
      if (f.size > CLAIM_FILE_LIMITS.maxBytes) { problems.push(`"${f.name}" is over 5 MB`); continue }
      if (!CLAIM_FILE_LIMITS.acceptedMime.includes(f.type)) { problems.push(`"${f.name}" is not PDF/JPG/PNG`); continue }
      next.push(f)
    }
    setFiles(next)
    setErrors(e => ({ ...e, files: problems.join(' · ') }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!validateStep(3) || !claimType) return
    setSubmitting(true)
    setSubmitError('')
    try {
      const fd = new FormData()
      fd.set('claimType', claimType)
      fd.set('awb', normalizedAwb)
      fd.set('flightNumber', form.flightNumber)
      fd.set('origin', form.origin)
      fd.set('destination', form.destination)
      fd.set('deliveryDate', form.deliveryDate)
      fd.set('declaredValue', form.declaredValue)
      fd.set('description', form.description.trim())
      fd.set('claimValue', form.claimValue)
      fd.set('goodCondition', String(form.goodCondition))
      fd.set('claimantName', form.claimantName.trim())
      fd.set('claimantCompany', form.claimantCompany.trim())
      fd.set('claimantEmail', form.claimantEmail.trim())
      fd.set('claimantPhone', `${form.countryCode.split(' ')[0]} ${form.phoneNumber.trim()}`)
      fd.set('relationship', form.relationship)
      fd.set('preferredContact', form.preferredContact)
      files.forEach(f => fd.append('files', f))

      const res = await fetch('/api/claims', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Submission failed (${res.status})`)
      track('claim_submitted', { claimType })
      setResult(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again, or email cargo@rwandair.com.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    const ref = lookupRef.trim().toUpperCase()
    if (!/^WB-CLM-\d{8}-\d{4}$/.test(ref)) {
      setLookupError('Please enter a valid reference (e.g. WB-CLM-20260612-0047)')
      return
    }
    setLookupBusy(true)
    setLookupError('')
    setLookupResult(null)
    try {
      const res = await fetch(`/api/claims/${encodeURIComponent(ref)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Lookup failed')
      setLookupResult(data)
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed. Please try again.')
    } finally {
      setLookupBusy(false)
    }
  }

  const fieldLabel = (text: string, required = true) => (
    <span className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--wb-blue)' }}>
      {text}{required && <span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>}
    </span>
  )

  const errorText = (key: string) =>
    errors[key] ? (
      <p id={`${key}-err`} role="alert" className="flex items-center gap-1 text-xs mt-1" style={{ color: '#dc2626' }}>
        <X className="w-3 h-3 shrink-0" aria-hidden="true" /> {errors[key]}
      </p>
    ) : null

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        {/* Hero — calm and supportive, not alarming */}
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Claims &amp; Service Recovery</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              File a Cargo Claim
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: '560px' }}>
              We&apos;re sorry your shipment didn&apos;t arrive as expected. Tell us what happened and
              our cargo desk will respond within 72 hours.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Tabs */}
          <div role="tablist" aria-label="Claims" className="flex gap-2 mb-8">
            {([['file', 'File a claim', FileText], ['status', 'Check claim status', Search]] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
                style={tab === key
                  ? { background: 'var(--wb-blue)', color: 'white' }
                  : { background: 'white', color: 'var(--wb-blue)', border: '1.5px solid var(--wb-gray-200)' }}
              >
                <Icon className="w-4 h-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>

          {/* ════════ TAB: FILE A CLAIM ════════ */}
          {tab === 'file' && (
            result ? (
              /* ── Confirmation screen ── */
              <div className="rounded-2xl p-8 sm:p-10 text-center"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <CheckCircle className="w-14 h-14 mx-auto mb-5" style={{ color: 'var(--wb-green)' }} aria-hidden="true" />
                <h2 className="mb-3" style={{ color: 'var(--wb-blue)' }}>Your claim has been registered</h2>
                <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                  Our cargo desk will contact you within <strong>72 hours</strong>, and we aim to resolve
                  claims within 30 days. A confirmation email is on its way to you
                  {form.preferredContact === 'whatsapp' && ', along with a WhatsApp confirmation'}.
                </p>
                <div className="inline-block rounded-xl px-6 py-4 mb-6"
                     style={{ background: 'var(--wb-sky-light)', border: '1px solid rgba(28,163,219,0.25)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--wb-gray-500)' }}>Your reference</p>
                  <p className="font-mono font-bold text-lg" style={{ color: 'var(--wb-blue)' }}>{result.claimRef}</p>
                </div>
                {result.timeLimitWarning && (
                  <p className="text-xs max-w-md mx-auto mb-6 px-4 py-3 rounded-lg text-left"
                     style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#B45309', lineHeight: 1.6 }}>
                    {result.timeLimitWarning}
                  </p>
                )}
                <button
                  onClick={() => { setLookupRef(result.claimRef); setTab('status'); setResult(null) }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm"
                  style={{ background: 'var(--wb-blue)', color: 'white' }}
                >
                  <Search className="w-4 h-4" aria-hidden="true" /> Track this claim
                </button>
              </div>
            ) : (
              <>
                {/* ── Claim type selector ── */}
                <fieldset className="mb-8">
                  <legend className="text-sm font-bold mb-3" style={{ color: 'var(--wb-blue)' }}>
                    What went wrong?<span aria-hidden="true" style={{ color: '#dc2626' }}> *</span>
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="radiogroup" aria-label="Claim type">
                    {CLAIM_TYPES.map(({ type, icon: Icon, label, desc }) => {
                      const active = claimType === type
                      return (
                        <button
                          key={type}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setClaimType(type)}
                          className="text-left rounded-xl p-4 transition-all"
                          style={{
                            background: active ? 'var(--wb-sky-light)' : 'white',
                            border: active ? '2px solid var(--wb-sky)' : '1.5px solid var(--wb-gray-200)',
                          }}
                        >
                          <Icon className="w-5 h-5 mb-2" style={{ color: active ? 'var(--wb-sky)' : 'var(--wb-gray-500)' }} aria-hidden="true" />
                          <p className="font-bold text-sm" style={{ color: 'var(--wb-blue)' }}>{label}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>{desc}</p>
                        </button>
                      )
                    })}
                  </div>
                  {claimType && (
                    <p className="text-xs mt-3 px-3 py-2 rounded-lg inline-block"
                       style={{ background: 'var(--wb-yellow-light)', border: '1px solid rgba(251,225,21,0.5)', color: 'var(--wb-gray-900)' }}>
                      ⏱ {CLAIM_TIME_LIMITS[claimType].label} (IATA Resolution 600a)
                    </p>
                  )}
                </fieldset>

                {claimType && (
                  <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>

                    {/* ── Progress indicator ── */}
                    <div className="mb-8">
                      <p className="text-xs font-bold mb-2" style={{ color: 'var(--wb-gray-500)' }}
                         aria-live="polite">
                        Step {step} of 3 — {step === 1 ? 'Shipment details' : step === 2 ? 'Claim details' : 'Your details'}
                      </p>
                      <div className="flex gap-1.5" aria-hidden="true">
                        {[1, 2, 3].map(s => (
                          <div key={s} className="h-1.5 flex-1 rounded-full transition-colors"
                               style={{ background: s <= step ? 'var(--wb-yellow)' : 'var(--wb-gray-200)' }} />
                        ))}
                      </div>
                    </div>

                    {/* ── STEP 1: Shipment details ── */}
                    {step === 1 && (
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="awb">{fieldLabel('AWB number')}</label>
                          <input id="awb" type="text" inputMode="numeric" value={form.awb}
                                 onChange={e => { set('awb', e.target.value); setAwbLookupDone(false) }}
                                 placeholder="459-12345678"
                                 aria-invalid={!!errors.awb} aria-describedby={errors.awb ? 'awb-err' : 'awb-help'}
                                 className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-colors"
                                 style={inputStyle(!!errors.awb)} />
                          {errorText('awb')}
                          {!errors.awb && (
                            <p id="awb-help" className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                              {awbValid && (form.origin || form.destination)
                                ? `✓ Route found: ${form.origin || '—'} → ${form.destination || '—'}`
                                : 'Your 11-digit air waybill number starting 459'}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="flightNumber">{fieldLabel('Flight number', false)}</label>
                            <input id="flightNumber" type="text" value={form.flightNumber}
                                   onChange={e => set('flightNumber', e.target.value)}
                                   placeholder="e.g. WB9304"
                                   className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                   style={inputStyle(false)} />
                          </div>
                          <div>
                            <label htmlFor="deliveryDate">{fieldLabel('Actual delivery date')}</label>
                            <input id="deliveryDate" type="date" value={form.deliveryDate}
                                   max={new Date().toISOString().slice(0, 10)}
                                   onChange={e => set('deliveryDate', e.target.value)}
                                   aria-invalid={!!errors.deliveryDate}
                                   aria-describedby={errors.deliveryDate ? 'deliveryDate-err' : undefined}
                                   className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                   style={inputStyle(!!errors.deliveryDate)} />
                            {errorText('deliveryDate')}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="origin">{fieldLabel('Origin', false)}</label>
                            <input id="origin" type="text" value={form.origin}
                                   onChange={e => set('origin', e.target.value.toUpperCase())}
                                   placeholder="KGL" maxLength={3}
                                   className="w-full px-4 py-3 rounded-lg text-sm font-mono uppercase outline-none"
                                   style={inputStyle(false)} />
                          </div>
                          <div>
                            <label htmlFor="destination">{fieldLabel('Destination', false)}</label>
                            <input id="destination" type="text" value={form.destination}
                                   onChange={e => set('destination', e.target.value.toUpperCase())}
                                   placeholder="LHR" maxLength={3}
                                   className="w-full px-4 py-3 rounded-lg text-sm font-mono uppercase outline-none"
                                   style={inputStyle(false)} />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="declaredValue">
                            {fieldLabel('Declared value (USD)', claimType === 'Loss' || claimType === 'Damage')}
                          </label>
                          <input id="declaredValue" type="number" min="0" step="0.01" value={form.declaredValue}
                                 onChange={e => set('declaredValue', e.target.value)}
                                 placeholder="e.g. 12500"
                                 aria-invalid={!!errors.declaredValue}
                                 aria-describedby={errors.declaredValue ? 'declaredValue-err' : undefined}
                                 className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                 style={inputStyle(!!errors.declaredValue)} />
                          {errorText('declaredValue')}
                        </div>

                        {timeCheck && !timeCheck.withinLimit && (
                          <div role="status" className="rounded-lg px-4 py-3 text-sm"
                               style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', color: '#B45309', lineHeight: 1.6 }}>
                            ⚠ {timeCheck.message}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── STEP 2: Claim details ── */}
                    {step === 2 && (
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="description">{fieldLabel('Describe what happened')}</label>
                          <textarea id="description" rows={5} value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Tell us what you found, when, and any details that will help us investigate — piece counts, packaging condition, seal numbers…"
                                    aria-invalid={!!errors.description}
                                    aria-describedby={errors.description ? 'description-err' : 'description-help'}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-y"
                                    style={inputStyle(!!errors.description)} />
                          {errorText('description')}
                          {!errors.description && (
                            <p id="description-help" className="text-xs mt-1" style={{ color: 'var(--wb-gray-500)' }}>
                              Minimum 50 characters · {form.description.trim().length}/50
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="claimValue">{fieldLabel('Estimated claim value (USD)', false)}</label>
                          <input id="claimValue" type="number" min="0" step="0.01" value={form.claimValue}
                                 onChange={e => set('claimValue', e.target.value)}
                                 placeholder="e.g. 940"
                                 className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                 style={inputStyle(false)} />
                        </div>

                        {/* File upload */}
                        <div>
                          {fieldLabel('Supporting documents', false)}
                          <p className="text-xs mb-2" style={{ color: 'var(--wb-gray-500)' }}>
                            Delivery receipt, photos, packing list, invoice — {CLAIM_FILE_LIMITS.acceptedLabel}
                          </p>
                          <button type="button" onClick={() => fileInputRef.current?.click()}
                                  disabled={files.length >= CLAIM_FILE_LIMITS.maxFiles}
                                  className="w-full flex flex-col items-center gap-2 px-4 py-6 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                  style={{ border: '2px dashed var(--wb-gray-200)', color: 'var(--wb-gray-500)', background: 'var(--wb-gray-50)' }}>
                            <Upload className="w-5 h-5" aria-hidden="true" />
                            {files.length ? `Add another file (${files.length}/${CLAIM_FILE_LIMITS.maxFiles})` : 'Tap to choose files'}
                          </button>
                          <input ref={fileInputRef} type="file" multiple className="sr-only"
                                 accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                 aria-label="Upload supporting documents"
                                 onChange={e => addFiles(e.target.files)} />
                          {errorText('files')}
                          {files.length > 0 && (
                            <ul className="mt-3 space-y-2">
                              {files.map((f, i) => (
                                <li key={`${f.name}-${i}`}
                                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm"
                                    style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                                  <span className="truncate" style={{ color: 'var(--wb-blue)' }}>
                                    {f.name} <span style={{ color: 'var(--wb-gray-500)' }}>({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                                  </span>
                                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                                          aria-label={`Remove ${f.name}`}
                                          className="p-1 rounded hover:bg-white">
                                    <X className="w-4 h-4" style={{ color: 'var(--wb-gray-500)' }} aria-hidden="true" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={form.goodCondition}
                                 onChange={e => set('goodCondition', e.target.checked)}
                                 aria-invalid={!!errors.goodCondition}
                                 className="mt-0.5 w-4 h-4 shrink-0 accent-[#00529C]" />
                          <span className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>
                            I confirm the goods were handed to RwandAir in good condition
                          </span>
                        </label>
                        {errorText('goodCondition')}
                      </div>
                    )}

                    {/* ── STEP 3: Claimant details ── */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label htmlFor="claimantName">{fieldLabel('Full name')}</label>
                            <input id="claimantName" type="text" autoComplete="name" value={form.claimantName}
                                   onChange={e => set('claimantName', e.target.value)}
                                   aria-invalid={!!errors.claimantName}
                                   aria-describedby={errors.claimantName ? 'claimantName-err' : undefined}
                                   className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                   style={inputStyle(!!errors.claimantName)} />
                            {errorText('claimantName')}
                          </div>
                          <div>
                            <label htmlFor="claimantCompany">{fieldLabel('Company name', false)}</label>
                            <input id="claimantCompany" type="text" autoComplete="organization" value={form.claimantCompany}
                                   onChange={e => set('claimantCompany', e.target.value)}
                                   className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                   style={inputStyle(false)} />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="claimantEmail">{fieldLabel('Email')}</label>
                          <input id="claimantEmail" type="email" autoComplete="email" value={form.claimantEmail}
                                 onChange={e => set('claimantEmail', e.target.value)}
                                 aria-invalid={!!errors.claimantEmail}
                                 aria-describedby={errors.claimantEmail ? 'claimantEmail-err' : undefined}
                                 className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                 style={inputStyle(!!errors.claimantEmail)} />
                          {errorText('claimantEmail')}
                        </div>

                        <div>
                          {fieldLabel('Phone')}
                          <div className="flex gap-2">
                            <select value={form.countryCode} onChange={e => set('countryCode', e.target.value)}
                                    aria-label="Country code"
                                    className="px-3 py-3 rounded-lg text-sm outline-none shrink-0"
                                    style={inputStyle(false)}>
                              {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input id="phoneNumber" type="tel" autoComplete="tel-national" value={form.phoneNumber}
                                   onChange={e => set('phoneNumber', e.target.value)}
                                   placeholder="7XX XXX XXX"
                                   aria-label="Phone number"
                                   aria-invalid={!!errors.phoneNumber}
                                   aria-describedby={errors.phoneNumber ? 'phoneNumber-err' : undefined}
                                   className="flex-1 min-w-0 px-4 py-3 rounded-lg text-sm outline-none"
                                   style={inputStyle(!!errors.phoneNumber)} />
                          </div>
                          {errorText('phoneNumber')}
                        </div>

                        <div>
                          <label htmlFor="relationship">{fieldLabel('Relationship to shipment')}</label>
                          <select id="relationship" value={form.relationship}
                                  onChange={e => set('relationship', e.target.value)}
                                  aria-invalid={!!errors.relationship}
                                  aria-describedby={errors.relationship ? 'relationship-err' : undefined}
                                  className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                  style={inputStyle(!!errors.relationship)}>
                            <option value="">Select…</option>
                            <option value="shipper">Shipper (I sent the cargo)</option>
                            <option value="consignee">Consignee (I was receiving the cargo)</option>
                            <option value="agent">Agent (acting on behalf of a client)</option>
                          </select>
                          {errorText('relationship')}
                        </div>

                        <fieldset>
                          <legend className="text-sm font-semibold mb-2" style={{ color: 'var(--wb-blue)' }}>
                            Preferred contact method
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {(['email', 'whatsapp', 'phone'] as const).map(m => (
                              <button key={m} type="button"
                                      role="radio" aria-checked={form.preferredContact === m}
                                      onClick={() => set('preferredContact', m)}
                                      className="px-4 py-2 rounded-full text-sm font-semibold capitalize transition-colors"
                                      style={form.preferredContact === m
                                        ? { background: 'var(--wb-blue)', color: 'white' }
                                        : { background: 'white', color: 'var(--wb-blue)', border: '1.5px solid var(--wb-gray-200)' }}>
                                {m === 'whatsapp' ? 'WhatsApp' : m}
                              </button>
                            ))}
                          </div>
                        </fieldset>

                        <p className="text-xs px-4 py-3 rounded-lg"
                           style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-gray-500)', lineHeight: 1.6 }}>
                          Your personal data will be used solely for processing this claim in accordance with our{' '}
                          <a href="https://www.rwandair.com/privacy-policy" target="_blank" rel="noopener noreferrer"
                             className="underline" style={{ color: 'var(--wb-blue)' }}>Privacy Policy</a>.
                        </p>
                      </div>
                    )}

                    {submitError && (
                      <div role="alert" className="rounded-lg p-3 text-sm mt-6 flex items-start gap-2"
                           style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', color: '#dc2626' }}>
                        <X className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" /> {submitError}
                      </div>
                    )}

                    {/* ── Step navigation ── */}
                    <div className="flex items-center justify-between gap-3 mt-8">
                      {step > 1 ? (
                        <button type="button" onClick={() => setStep(step - 1)}
                                className="px-5 py-3 rounded-full text-sm font-bold"
                                style={{ color: 'var(--wb-blue)', border: '1.5px solid var(--wb-gray-200)', background: 'white' }}>
                          ← Back
                        </button>
                      ) : <span />}
                      {step < 3 ? (
                        <button type="button"
                                onClick={() => { if (validateStep(step)) setStep(step + 1) }}
                                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-bold"
                                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
                          Continue <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button type="button" onClick={handleSubmit} disabled={submitting}
                                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-sm font-bold transition-opacity"
                                style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)', opacity: submitting ? 0.7 : 1 }}>
                          {submitting ? 'Submitting…' : 'Submit claim'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )
          )}

          {/* ════════ TAB: STATUS LOOKUP ════════ */}
          {tab === 'status' && (
            <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label htmlFor="lookupRef" className="sr-only">Claim reference number</label>
                  <input id="lookupRef" type="text" value={lookupRef}
                         onChange={e => { setLookupRef(e.target.value); setLookupError('') }}
                         placeholder="WB-CLM-20260612-0047"
                         aria-invalid={!!lookupError}
                         className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none"
                         style={inputStyle(!!lookupError)} />
                </div>
                <button type="submit" disabled={lookupBusy}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold shrink-0"
                        style={{ background: 'var(--wb-blue)', color: 'white', opacity: lookupBusy ? 0.7 : 1 }}>
                  <Search className="w-4 h-4" aria-hidden="true" />
                  {lookupBusy ? 'Checking…' : 'Check status'}
                </button>
              </form>
              {lookupError && (
                <p role="alert" className="flex items-center gap-1 text-xs mt-2" style={{ color: '#dc2626' }}>
                  <X className="w-3 h-3" aria-hidden="true" /> {lookupError}
                </p>
              )}

              {lookupResult && (
                <div className="mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4"
                       style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
                    <div>
                      <p className="font-mono font-bold" style={{ color: 'var(--wb-blue)' }}>{lookupResult.claimRef}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>
                        {lookupResult.claimType} claim · AWB {lookupResult.awb} · filed{' '}
                        {new Date(lookupResult.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full text-sm font-bold"
                          style={{ background: STATUS_COLORS[lookupResult.status].bg, color: STATUS_COLORS[lookupResult.status].color }}>
                      {lookupResult.status}
                    </span>
                  </div>

                  <ol className="mt-5 space-y-4">
                    {lookupResult.timeline.map((ev, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                                style={{ background: STATUS_COLORS[ev.status].color }} aria-hidden="true" />
                          {i < lookupResult.timeline.length - 1 && (
                            <span className="w-px flex-1 mt-1" style={{ background: 'var(--wb-gray-200)' }} aria-hidden="true" />
                          )}
                        </div>
                        <div className="pb-2">
                          <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>{ev.status}</p>
                          {ev.note && <p className="text-sm mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>{ev.note}</p>}
                          <time className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
                            {new Date(ev.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* ════════ FAQ accordion ════════ */}
          <section className="mt-12" aria-label="Frequently asked questions">
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--wb-blue)' }}>Common questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl overflow-hidden"
                     style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                          aria-expanded={openFaq === i}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left text-sm font-bold"
                          style={{ color: 'var(--wb-blue)' }}>
                    {faq.q}
                    <ChevronDown className="w-4 h-4 shrink-0 transition-transform"
                                 style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none', color: 'var(--wb-gray-500)' }}
                                 aria-hidden="true" />
                  </button>
                  {openFaq === i && (
                    <p className="px-5 pb-4 text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ════════ Compliance footer ════════ */}
          <p className="mt-10 text-xs" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
            {MONTREAL_CONVENTION_NOTE} Time limits for written notification under IATA Resolution 600a:
            damage within 14 days, delay within 21 days, and loss within 120 days.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
