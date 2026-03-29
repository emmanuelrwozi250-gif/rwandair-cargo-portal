'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Globe, ChevronDown, Search, Zap } from 'lucide-react'
import { RwandAirCargoLogoMark } from '@/components/brand/RwandAirCargoLogo'
import {
  useLanguage,
  LOCALES, LOCALE_NAMES, LOCALE_FLAGS,
} from '@/components/providers/LanguageProvider'
import type { Locale } from '@/lib/i18n'

export default function Navbar() {
  const pathname                    = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen]     = useState(false)
  const { locale, setLocale, t }    = useLanguage()

  const NAV_LINKS = [
    { href: '/quote',       label: 'Get a Quote' },
    { href: '/consolidate', label: 'Consolidate' },
    { href: '/capacity',    label: 'Capacity' },
    { href: '/deals',       label: 'Deals' },
    { href: '/perishables', label: 'Perishables' },
    { href: '/stations',    label: 'Stations' },
    { href: '/agents',      label: 'For Agents' },
  ]

  function pickLocale(l: Locale) {
    setLocale(l)
    setLangOpen(false)
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50"
        style={{ background: '#071830', boxShadow: '0 1px 0 rgba(255,255,255,0.08)' }}
        role="banner"
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="RwandAir Cargo — home">
            <RwandAirCargoLogoMark size={36} />
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
            {/* Language picker */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-sm font-semibold transition-colors"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                aria-label="Change language"
                aria-expanded={langOpen}
                aria-haspopup="listbox"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                <span>{LOCALE_FLAGS[locale]}</span>
                <ChevronDown className="w-3 h-3" style={{ opacity: 0.6 }} aria-hidden="true" />
              </button>

              {langOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} aria-hidden="true" />
                  <div
                    className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 w-44"
                    style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '1px solid rgba(4,84,155,0.1)' }}
                    role="listbox"
                    aria-label="Select language"
                  >
                    {LOCALES.map(l => (
                      <button
                        key={l}
                        onClick={() => pickLocale(l)}
                        role="option"
                        aria-selected={l === locale}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                        style={{
                          color: l === locale ? 'var(--brand-blue)' : 'var(--neutral-dark)',
                          background: l === locale ? 'rgba(4,84,155,0.06)' : 'transparent',
                          fontWeight: l === locale ? 700 : 400,
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{LOCALE_FLAGS[l]}</span>
                        <span>{LOCALE_NAMES[l]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Track Shipment CTA */}
            <Link
              href="/track"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.9)', border: '1.5px solid rgba(28,163,219,0.6)' }}
            >
              <Search className="w-3.5 h-3.5" aria-hidden="true" />
              Track Shipment
            </Link>

            {/* Book Now CTA (primary) */}
            <Link
              href="/quote"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all cta-primary"
              style={{ background: 'var(--brand-yellow)', color: 'var(--brand-blue)' }}
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Book Cargo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Compact Track on mobile header */}
            <Link
              href="/track"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ border: '1px solid rgba(28,163,219,0.5)', color: 'rgba(255,255,255,0.8)' }}
              aria-label="Track shipment"
            >
              <Search className="w-3 h-3" aria-hidden="true" /> Track
            </Link>
            <button
              className="p-2 rounded text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </nav>

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
                      className="flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-xs font-semibold"
                      aria-label={`Switch to ${LOCALE_NAMES[l]}`}
                      aria-pressed={l === locale}
                      style={{
                        color: l === locale ? 'var(--brand-blue)' : 'rgba(255,255,255,0.8)',
                        background: l === locale ? 'var(--brand-yellow)' : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{LOCALE_FLAGS[l]}</span>
                      <span>{LOCALE_NAMES[l]}</span>
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
                  Track Shipment
                </Link>
                <Link
                  href="/quote"
                  className="block px-3 py-3 rounded-xl text-center text-sm font-bold"
                  style={{ background: 'var(--brand-yellow)', color: 'var(--brand-blue)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Book Cargo
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
