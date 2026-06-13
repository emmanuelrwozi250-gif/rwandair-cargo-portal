'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Search, Zap } from 'lucide-react'
import { track } from '@vercel/analytics'
import RwandAirCargoLogo from '@/components/brand/RwandAirCargoLogo'
import {
  useLanguage,
  LOCALES, LOCALE_NAMES, LOCALE_LABELS,
} from '@/components/providers/LanguageProvider'
import type { Locale } from '@/lib/i18n'

const NAV_AWB_REGEX = /^459-\d{8}$/

// Inline AWB tracker for the sticky navbar (Feature 5a). Desktop: always-visible
// input. Mobile: rendered inside an expanding row under the header.
function AwbQuickTrack({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = value.trim().replace(/\s+/g, '')
    const candidate = /^\d{11}$/.test(cleaned) ? `${cleaned.slice(0, 3)}-${cleaned.slice(3)}` : cleaned
    if (!NAV_AWB_REGEX.test(candidate)) {
      setError(true)
      return
    }
    setError(false)
    track('navbar_track')
    router.push(`/track?awb=${candidate}`)
    onNavigate?.()
  }

  return (
    <form onSubmit={submit} className={compact ? 'w-full' : 'relative'} aria-label="Track a shipment">
      <div className="flex items-center rounded-full overflow-hidden"
           style={{ border: error ? '1.5px solid #FCA5A5' : '1.5px solid rgba(28,163,219,0.6)', background: 'rgba(255,255,255,0.08)' }}>
        <label htmlFor={compact ? 'awb-track-m' : 'awb-track'} className="sr-only">
          Track AWB number
        </label>
        <input
          id={compact ? 'awb-track-m' : 'awb-track'}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => { setValue(e.target.value); setError(false) }}
          placeholder="Track AWB e.g. 459-12345678"
          aria-invalid={error}
          aria-describedby={error ? (compact ? 'awb-err-m' : 'awb-err') : undefined}
          className={`bg-transparent outline-none font-mono ${compact ? 'flex-1 px-4 py-2.5 text-sm' : 'w-[200px] xl:w-[220px] px-3.5 py-2 text-xs'}`}
          style={{ color: 'white' }}
        />
        <button type="submit" aria-label="Track shipment"
                className={`flex items-center justify-center transition-colors hover:bg-white/10 ${compact ? 'px-4 py-2.5' : 'px-3 py-2'}`}
                style={{ color: 'var(--wb-yellow)' }}>
          <Search className={compact ? 'w-5 h-5' : 'w-3.5 h-3.5'} aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p id={compact ? 'awb-err-m' : 'awb-err'} role="alert"
           className={`text-xs font-semibold ${compact ? 'mt-1.5' : 'absolute top-full left-0 mt-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap'}`}
           style={compact
             ? { color: '#FCA5A5' }
             : { background: '#7F1D1D', color: '#FECACA', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
          Please enter a valid AWB number (e.g. 459-12345678)
        </p>
      )}
    </form>
  )
}

export default function Navbar() {
  const pathname                    = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [trackOpen, setTrackOpen]   = useState(false)
  const { locale, setLocale, t }    = useLanguage()

  const NAV_LINKS: { href: string; label: string }[] = [
    { href: '/quote',       label: t('navQuote') },
    { href: '/capacity',    label: t('navCapacity') },
    { href: '/perishables', label: t('navPerishables') },
    { href: '/charter',     label: t('navCharter') },
    { href: '/stations',    label: t('navStations') },
    { href: '/news',        label: t('navNews') },
  ]

  function pickLocale(l: Locale) {
    setLocale(l)
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: 'var(--brand-blue)', boxShadow: '0 2px 0 rgba(0,0,0,0.15)' }}
        role="banner"
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="RwandAir Cargo — home">
            <RwandAirCargoLogo size={36} />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden lg:flex items-center gap-0.5" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className="px-3 py-1.5 rounded text-sm font-semibold transition-colors relative"
                    style={{
                      color: active ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.85)',
                      background: active ? 'rgba(228,220,31,0.12)' : 'transparent',
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                    {/* Active underline indicator */}
                    {active && (
                      <span
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                        style={{ background: 'var(--brand-yellow)' }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Right: language + Track + Book Now */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Plain-text EN / FR / AR switcher (no flags) */}
            <div className="flex items-center gap-0.5" role="group" aria-label="Language">
              {LOCALES.map((l, i) => (
                <span key={l} className="flex items-center">
                  {i > 0 && <span aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)' }}>/</span>}
                  <button
                    onClick={() => pickLocale(l)}
                    aria-label={`Switch to ${LOCALE_NAMES[l]}`}
                    aria-current={l === locale ? 'true' : undefined}
                    className="px-1.5 py-1 text-sm font-bold transition-colors"
                    style={{ color: l === locale ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.7)' }}
                  >
                    {LOCALE_LABELS[l]}
                  </button>
                </span>
              ))}
            </div>

            {/* Inline AWB tracking (Feature 5a) */}
            <AwbQuickTrack />

            {/* Book Now CTA (primary) */}
            <Link
              href="/quote"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cta-primary"
              style={{ background: 'var(--brand-yellow)', color: 'var(--brand-blue)' }}
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              {t('ctaBook')}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Search icon expands the AWB tracking row (Feature 5a) */}
            <button
              className="p-2 rounded-full"
              onClick={() => { setTrackOpen(v => !v); setMobileOpen(false) }}
              aria-label={trackOpen ? 'Close shipment tracking' : 'Track a shipment'}
              aria-expanded={trackOpen}
              aria-controls="mobile-track"
              style={{ color: trackOpen ? 'var(--wb-yellow)' : 'rgba(255,255,255,0.85)', border: '1px solid rgba(28,163,219,0.5)' }}
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              className="p-2 rounded text-white"
              onClick={() => { setMobileOpen(!mobileOpen); setTrackOpen(false) }}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile expanding AWB tracker */}
        {trackOpen && (
          <div id="mobile-track" className="lg:hidden px-4 py-3 border-t"
               style={{ background: 'var(--brand-blue-dark)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <AwbQuickTrack compact onNavigate={() => setTrackOpen(false)} />
          </div>
        )}

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t"
            style={{ background: 'var(--brand-blue-dark)', borderColor: 'rgba(255,255,255,0.1)' }}
            aria-label="Mobile navigation"
          >
            <ul className="px-4 py-3 space-y-1" role="list">
              {NAV_LINKS.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="block px-3 py-3 rounded-lg text-sm font-semibold"
                      style={{
                        color: active ? 'var(--brand-yellow)' : 'white',
                        background: active ? 'rgba(228,220,31,0.1)' : 'transparent',
                      }}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}

              {/* Mobile language grid */}
              <li className="pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Language
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {LOCALES.map(l => (
                    <button
                      key={l}
                      onClick={() => { pickLocale(l); setMobileOpen(false) }}
                      className="py-2.5 rounded-lg text-sm font-bold"
                      aria-label={`Switch to ${LOCALE_NAMES[l]}`}
                      aria-pressed={l === locale}
                      style={{
                        color: l === locale ? 'var(--brand-blue)' : 'rgba(255,255,255,0.8)',
                        background: l === locale ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {LOCALE_LABELS[l]}
                    </button>
                  ))}
                </div>
              </li>

              {/* Mobile CTAs */}
              <li className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/track"
                  className="block px-3 py-3 rounded-xl text-center text-sm font-bold"
                  style={{ border: '1.5px solid rgba(28,163,219,0.6)', color: 'rgba(255,255,255,0.9)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t('ctaTrack')}
                </Link>
                <Link
                  href="/quote"
                  className="block px-3 py-3 rounded-xl text-center text-sm font-bold"
                  style={{ background: 'var(--brand-yellow)', color: 'var(--brand-blue)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t('ctaBook')}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Mobile sticky bottom CTA bar (hidden on desktop and when menu is open) */}
      {!mobileOpen && (
        <div
          className="fixed bottom-0 inset-x-0 z-40 lg:hidden flex border-t no-print"
          style={{ background: 'var(--brand-blue)', borderColor: 'rgba(255,255,255,0.1)' }}
          aria-label="Quick actions"
        >
          <Link
            href="/track"
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-bold transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.85)' }}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            Track
          </Link>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} aria-hidden="true" />
          <Link
            href="/quote"
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-xs font-bold transition-colors"
            style={{ background: 'var(--brand-yellow)', color: 'var(--brand-blue)' }}
          >
            <Zap className="w-5 h-5" aria-hidden="true" />
            Book Cargo
          </Link>
        </div>
      )}
    </>
  )
}
