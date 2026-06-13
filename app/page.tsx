'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Zap, Package, Globe2, Plane, Shield, Leaf,
  ChevronRight, Clock, MessageCircle, Tag,
  Thermometer, Star, Heart, AlertTriangle, Truck,
  Box, Warehouse,
} from 'lucide-react'
import RouteGlobe from '@/components/globe/RouteGlobe'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ConnectivityLines from '@/components/brand/ConnectivityLines'
import ImigongoPattern from '@/components/brand/ImigongoPattern'
import HeroQuoteWidget from '@/components/home/HeroQuoteWidget'
import LiveTestimonials from '@/components/home/LiveTestimonials'
import CapacityTeaser from '@/components/home/CapacityTeaser'


// ─── Stat ticker ──────────────────────────────────────────────────────────────
const TICKER = [
  'Built to move Africa — 40+ destinations',
  '98.2% on-time',
  'Rwanda\'s goods, moving the world tonight',
  'WB9308 departing tonight: KGL → JIB → SHJ → JUB',
  '340+ consolidations matched this month',
  'From Africa, for the world',
  'WB9316 Mon 00:30: KGL → Djibouti → Dubai Al Maktoum',
  'Average shipper saving: 21% via consolidation',
  'Cold-chain certified for pharmaceuticals & perishables',
  'Freighter departing KGL tonight: WB9304 → Sharjah, space available',
]

// ─── Africa SVG watermark ─────────────────────────────────────────────────────
function AfricaWatermark() {
  return (
    <svg
      viewBox="0 0 400 500"
      className="absolute pointer-events-none select-none"
      style={{
        right: '-60px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '520px',
        height: '650px',
        opacity: 0.04,
        fill: 'white',
        zIndex: 1,
      }}
      aria-hidden="true"
    >
      {/* Simplified Africa polygon silhouette */}
      <polygon points="
        170,10
        210,8
        240,18
        270,30
        295,55
        310,80
        320,110
        330,140
        335,170
        340,200
        338,230
        330,255
        318,275
        300,295
        278,315
        260,340
        248,365
        240,390
        232,415
        225,440
        220,465
        215,488
        210,495
        205,488
        200,470
        196,450
        190,425
        182,400
        172,375
        160,355
        145,338
        128,318
        110,295
        95,270
        82,245
        72,220
        65,195
        60,168
        58,140
        62,112
        70,86
        82,65
        98,46
        118,30
        142,18
      " />
      {/* Madagascar */}
      <polygon points="
        320,240
        330,225
        338,235
        342,255
        340,275
        335,290
        328,300
        322,295
        316,278
        314,260
        316,245
      " />
    </svg>
  )
}


// ─── Animated stats counter ───────────────────────────────────────────────────
function AnimatedStat({ target, suffix, label }: { target: string; suffix?: string; label: string }) {
  // Initialize with the real value so SSR and no-JS always render the correct number
  const numericFinal = parseFloat(target.replace(/[^0-9.]/g, ''))
  const hasDecimal   = target.includes('.')
  const finalStr     = hasDecimal ? numericFinal.toFixed(1) : Math.floor(numericFinal).toString()

  const [displayed, setDisplayed] = useState(finalStr)
  const ref    = useRef<HTMLDivElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true
          const duration = 1200
          const steps    = 40
          const interval = duration / steps
          let step = 0
          // Reset to 0 to start the count-up animation (progressive enhancement)
          setDisplayed(hasDecimal ? '0.0' : '0')
          const timer = setInterval(() => {
            step++
            const progress = step / steps
            const eased    = 1 - Math.pow(1 - progress, 3)
            const current  = numericFinal * eased
            setDisplayed(hasDecimal ? current.toFixed(1) : Math.floor(current).toString())
            if (step >= steps) {
              clearInterval(timer)
              setDisplayed(finalStr)
            }
          }, interval)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  // Build display value — preserve prefix/suffix characters from target
  const prefix = target.match(/^[^0-9]*/)?.[0] ?? ''
  const postfix = target.match(/[^0-9.]+$/)?.[0] ?? ''

  return (
    <div ref={ref} className="text-center px-8 py-10">
      <div className="font-bold mb-2" style={{ fontSize: 'clamp(36px,4vw,56px)', color: '#FBE115', lineHeight: 1 }}>
        {prefix}{displayed}{postfix}{suffix}
      </div>
      <div className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>{label}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [trackInput, setTrackInput] = useState('')
  const router = useRouter()

  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
               style={{
                 backgroundImage: "linear-gradient(rgba(0,82,156,0.82), rgba(0,62,120,0.88)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80&fit=crop')",
                 backgroundSize: 'cover',
                 backgroundPosition: 'center top',
                 backgroundColor: 'var(--brand-blue)',
                 minHeight: '100vh',
               }}>
        <ImigongoPattern color="white" opacity={0.015} />
        <ConnectivityLines opacity={0.08} variant="light" />
        <AfricaWatermark />

        {/* Radial glow behind headline */}
        <div className="absolute pointer-events-none" aria-hidden="true" style={{
          top: '80px', left: '-80px',
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse at 30% 40%, rgba(28,163,219,0.13) 0%, transparent 65%)',
          zIndex: 1,
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[136px] pb-[100px]">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ background: 'rgba(228,220,31,0.15)', border: '1px solid rgba(228,220,31,0.3)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--wb-yellow)' }} />
              <span className="label-upper text-xs" style={{ color: 'var(--wb-yellow)' }}>
                Africa&apos;s cargo, live and moving
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                 style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FBE115" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <span className="text-xs font-semibold text-white">Top-Rated African Cargo Carrier · 2025</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Headlines & CTAs */}
            <div>
              <h1 className="text-white mb-3" style={{ fontSize: 'clamp(40px,5.5vw,72px)', lineHeight: 1.05, fontWeight: 800 }}>
                Built to Move Africa.
              </h1>
              <p className="mb-3" style={{ fontSize: 'clamp(16px,2vw,22px)', color: 'var(--wb-yellow)', letterSpacing: '0.01em', fontWeight: 500 }}>
                From Africa, for the world — 40+ destinations, one hub, zero compromise.
              </p>
              <p className="text-base mb-8 max-w-lg"
                 style={{ color: 'rgba(255,255,255,0.82)', fontWeight: 400, lineHeight: 1.7 }}>
                From Rwandan flowers to African pharmaceuticals — lifted from Kigali with
                cold-chain precision, on-time every time.
              </p>

              {/* Inline quote widget (replaces the single CTA button) */}
              <HeroQuoteWidget />
              <div className="mt-4">
                <Link href="/stations"
                      className="inline-flex items-center gap-2 font-bold text-sm transition-all hover:bg-white/10"
                      style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)', padding: '12px 24px', borderRadius: '8px' }}>
                  <Plane className="w-4 h-4" /> Explore our routes
                </Link>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { Icon: Plane,   value: '40+',   unit: 'routes', label: 'Active cargo routes' },
                { Icon: Clock,   value: '98.2%', unit: '',        label: 'On-time delivery rate' },
                { Icon: Tag,     value: 'from $2.80', unit: '/kg', label: 'Rates — get a quote in 30s' },
                { Icon: Package, value: '340+',  unit: '',        label: 'Consolidations this month' },
              ].map(({ Icon, value, unit, label }) => (
                <div key={label}
                     style={{
                       background: 'rgba(255,255,255,0.07)',
                       border: '1px solid rgba(255,255,255,0.12)',
                       borderRadius: '12px',
                       padding: '20px 24px',
                     }}>
                  <Icon style={{ width: 20, height: 20, color: 'rgba(255,255,255,0.65)', marginBottom: 12 }} aria-hidden="true" />
                  <div className="font-bold text-white" style={{ fontSize: '28px', lineHeight: 1, marginBottom: 6 }}>
                    {value}
                    {unit && <span className="font-semibold ml-1" style={{ fontSize: 14, color: 'var(--wb-sky)' }}>{unit}</span>}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Route map — animated 3D globe */}
          <div className="mt-14 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(28,163,219,0.2)' }}>
            <RouteGlobe height={520} />
            <div className="mt-3 flex justify-end">
              <Link href="/stations"
                    className="inline-flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'rgba(255,255,255,0.55)' }}>
                View all cargo stations &amp; handler details
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stat ticker pinned to bottom */}
        <div className="absolute bottom-0 inset-x-0 overflow-hidden py-3"
             style={{ background: 'rgba(0,61,116,0.6)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="ticker-track flex gap-16">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="shrink-0 text-xs font-semibold flex items-center gap-2"
                    style={{ color: 'rgba(255,255,255,0.65)' }}>
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--wb-sky)' }} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking lead times banner ──────────────────────────────────────── */}
      <section className="pb-20 lg:pb-0" style={{ background: 'var(--wb-gray-50)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="rounded-xl px-6 py-4 flex flex-wrap items-start gap-4"
               style={{
                 background: 'rgba(228,220,31,0.07)',
                 border: '1px solid rgba(228,220,31,0.25)',
                 borderLeft: '4px solid var(--wb-yellow)',
               }}>
            <span className="text-lg shrink-0 mt-0.5">⏱</span>
            <div>
              <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--wb-blue)' }}>
                Booking lead times
              </p>
              <p className="text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>
                Book at least <strong>96 hours before departure</strong> for direct flights,{' '}
                <strong>72 hours</strong> for connecting routes.{' '}
                Max package weight: <strong>80 kg per piece</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick-action cards ─────────────────────────────────────────────── */}
      <section className="py-12 pb-20 lg:pb-20" style={{ background: 'var(--wb-gray-50)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ color: 'var(--wb-blue)' }}>Move something. Right now.</h2>
            <p className="mt-2" style={{ color: 'var(--wb-gray-500)' }}>From Africa to anywhere — in seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Quote',
                desc: 'Three routes. Live pricing. 30 seconds. Move your cargo the smart way, from anywhere in Africa.',
                cta: 'Get a quote',
                href: '/quote',
              },
              {
                icon: Package,
                title: 'Join Consolidation',
                desc: 'African shippers moving in the same direction? We match you. Save up to 25% and secure your space on tonight\'s departure.',
                cta: 'Find consolidation',
                href: '/consolidate',
              },
              {
                icon: Clock,
                title: 'Last-Minute Deals',
                desc: 'Tonight\'s aircraft leaves Kigali with space to fill. Claim it. Up to 30% off — expires at departure.',
                cta: 'View live deals',
                href: '/deals',
              },
            ].map(({ icon: Icon, title, desc, cta, href }) => (
              <Link key={href} href={href}
                    className="group relative overflow-hidden rounded-2xl p-8 card-lift"
                    style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                {/* Yellow left accent */}
                <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl"
                     style={{ background: 'var(--wb-yellow)' }} />
                {/* Imigongo bg texture */}
                <div className="absolute right-0 bottom-0 w-28 h-28 overflow-hidden pointer-events-none">
                  <svg viewBox="0 0 60 60" className="w-full h-full opacity-20">
                    <polygon points="30,2 58,30 30,58 2,30" fill="none"
                             stroke="#00529C" strokeWidth="1" strokeOpacity="0.3" />
                    <polygon points="30,14 46,30 30,46 14,30" fill="#00529C" fillOpacity="0.08" />
                  </svg>
                </div>
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                       style={{ background: 'var(--wb-sky-light)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
                  </div>
                  <h3 className="mb-2" style={{ color: 'var(--wb-blue)' }}>{title}</h3>
                  <p className="text-sm mb-6" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>{desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold"
                        style={{ color: 'var(--wb-sky)' }}>
                    {cta}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketplace trust badges ───────────────────────────────────────── */}
      <div style={{ background: 'var(--wb-gray-50)', borderTop: '1px solid var(--wb-gray-200)', borderBottom: '1px solid var(--wb-gray-200)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-xs font-semibold shrink-0" style={{ color: 'var(--wb-gray-500)' }}>
            Book via your preferred platform:
          </span>
          {['cargo.one', 'WebCargo', 'CargoAi', 'Flexport', 'Freightos', 'CargoWise'].map(name => (
            <span key={name} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'white', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Testimonials — live verified reviews with static fallback ──────── */}
      <LiveTestimonials />

      {/* ── Partner logo strip ──────────────────────────────────────────────── */}
      <div style={{ background: 'white', borderTop: '1px solid var(--wb-gray-200)', borderBottom: '1px solid var(--wb-gray-200)', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-xs font-semibold mb-4" style={{ color: 'var(--wb-gray-500)' }}>
            Integrated with the platforms you already use
          </p>
          <div className="relative overflow-hidden"
               onMouseEnter={e => (e.currentTarget.querySelector('.logo-scroll') as HTMLElement)?.style.setProperty('animation-play-state','paused')}
               onMouseLeave={e => (e.currentTarget.querySelector('.logo-scroll') as HTMLElement)?.style.setProperty('animation-play-state','running')}>
            <div className="logo-scroll flex gap-8 items-center"
                 style={{ animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
              {[...['cargo.one','WebCargo','CargoAi','Flexport','Freightos','CargoWise','Patch.io'],
                 ...['cargo.one','WebCargo','CargoAi','Flexport','Freightos','CargoWise','Patch.io']].map((name, i) => (
                <span key={i} className="shrink-0 text-sm font-bold px-4 py-2 rounded-lg"
                      style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)', color: 'var(--wb-blue)' }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Cargo Services Grid ─────────────────────────────────────────────── */}
      <section className="py-20 pb-20 lg:pb-20" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Cargo Services</p>
            <h2 style={{ color: 'var(--wb-blue)' }}>Built for what Africa moves</h2>
            <p className="mt-2 max-w-2xl mx-auto" style={{ color: 'var(--wb-gray-500)' }}>
              Eleven cargo categories — because what Africa ships deserves infrastructure built for it.
              Flowers. Pharmaceuticals. Livestock. Valuables. All moving from Kigali.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              {
                slug: 'general-cargo',
                name: 'General Cargo',
                tagline: 'Reliable, all-route',
                desc: 'Everything Africa ships. Across all 40+ routes, consolidated or direct — space guaranteed.',
                color: '#00529C',
                bgColor: 'rgba(4,84,155,0.07)',
                icon: Package,
                badge: 'Consolidation eligible',
              },
              {
                slug: 'perishables',
                name: 'Perishables',
                tagline: 'Active cold-chain',
                desc: 'Rwanda\'s flowers. Uganda\'s fish. Africa\'s fresh produce — cold-chain from farm gate to landing.',
                color: '#94C944',
                bgColor: 'rgba(45,125,70,0.08)',
                icon: Thermometer,
                badge: 'Cold-chain monitored',
              },
              {
                slug: 'pharmaceuticals',
                name: 'Pharmaceuticals',
                tagline: 'GDP-certified',
                desc: 'Medicines that Africa needs. Vaccines going out, treatments coming in. CEIV Pharma certified end-to-end.',
                color: '#16A1DC',
                bgColor: 'rgba(28,163,219,0.08)',
                icon: Shield,
                badge: 'CEIV Pharma',
              },
              {
                slug: 'dangerous-goods',
                name: 'Dangerous Goods',
                tagline: 'IATA DGR compliant',
                desc: 'IATA DGR compliant. Passenger and freighter aircraft. Trained DG specialists.',
                color: '#DC2626',
                bgColor: 'rgba(220,38,38,0.07)',
                icon: AlertTriangle,
                badge: 'IATA DGR',
              },
              {
                slug: 'live-animals',
                name: 'Live Animals',
                tagline: 'IATA LAR compliant',
                desc: 'IATA LAR compliant. Climate-controlled holds. Welfare monitoring throughout.',
                color: '#EC4899',
                bgColor: 'rgba(236,72,153,0.08)',
                icon: Heart,
                badge: 'IATA LAR',
              },
              {
                slug: 'valuable-goods',
                name: 'Valuable Goods',
                tagline: 'Vault-secured',
                desc: 'Gold, platinum, banknotes, securities. Vault storage, dual-lock secure loading.',
                color: '#7C3AED',
                bgColor: 'rgba(124,58,237,0.07)',
                icon: Star,
                badge: 'Security escort',
              },
              {
                slug: 'human-remains',
                name: 'Human Remains',
                tagline: 'Handled with care',
                desc: 'Handled with care, discretion, and trained staff. Full documentation and family liaison support.',
                color: '#6B7280',
                bgColor: 'rgba(107,114,128,0.07)',
                icon: Leaf,
                badge: 'Full discretion',
              },
              {
                slug: 'parcels',
                name: 'Parcels',
                tagline: 'Door-to-door parcel delivery',
                desc: 'Affordable, tracked parcel delivery on all routes. AWB 459 assigned instantly. Consolidation-eligible for e-commerce shippers.',
                color: '#F97316',
                bgColor: 'rgba(249,115,22,0.07)',
                icon: Box,
                badge: 'Full track & trace',
              },
              {
                slug: 'courier',
                name: 'Courier',
                tagline: 'Next-flight-out express',
                desc: 'Urgent. African. Moving tonight. Same-day collection, next departure guaranteed — documents, samples, urgent packages.',
                color: '#0891B2',
                bgColor: 'rgba(8,145,178,0.07)',
                icon: Truck,
                badge: 'Next-flight-out',
              },
              {
                slug: 'cargo-handling',
                name: 'Cargo Handling',
                tagline: 'ISAGO-certified at KGL',
                desc: 'Kigali-based. ISAGO-certified. The hands that load Africa\'s exports for the world — ramp, ULD, cold-chain, screening.',
                color: '#475569',
                bgColor: 'rgba(71,85,105,0.07)',
                icon: Warehouse,
                badge: 'ISAGO certified',
              },
              {
                slug: 'charter',
                name: 'Charter',
                tagline: 'Full aircraft on demand',
                desc: 'The whole aircraft. Your route, your timing. 22,000kg of African cargo moving on your terms. 2-hour quote response.',
                color: '#1D4ED8',
                bgColor: 'rgba(29,78,216,0.07)',
                icon: Plane,
                badge: 'B737-800F',
              },
            ].map(({ slug, name, tagline, desc, color, bgColor, icon: Icon, badge }) => (
              <Link key={slug} href={`/products/${slug}`}
                    className="group relative overflow-hidden rounded-2xl p-7 card-lift transition-all"
                    style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                     style={{ background: color }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: bgColor }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold" style={{ color: 'var(--wb-blue)' }}>{name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                        style={{ background: bgColor, color }}>
                    {badge}
                  </span>
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color }}>{tagline}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--wb-gray-500)' }}>{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold"
                     style={{ color: 'var(--wb-sky)' }}>
                  Learn more
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Live capacity teaser ──────────────────────────────────────────── */}
      <CapacityTeaser />

      {/* ── Animated stats bar ────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--brand-blue-dark)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            <AnimatedStat target="40"   suffix="+"  label="Destinations" />
            <AnimatedStat target="11"   suffix=""   label="Cargo categories" />
            <AnimatedStat target="98.2" suffix="%"  label="On-time rate" />
            <AnimatedStat target="24"   suffix="/7" label="Support" />
          </div>
        </div>
      </section>

      {/* ── Why RwandAir Cargo ─────────────────────────────────────────────── */}
      <section className="py-20 pb-20 lg:pb-20" style={{ background: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Why RwandAir Cargo</p>
              <h2 style={{ color: 'var(--wb-blue)' }}>Why we&apos;re built for this</h2>
              <p className="mt-4 text-base" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.75 }}>
                This is Africa&apos;s carrier — built from the ground up in Kigali to move what Africa
                produces. Not adapted from somewhere else. Not an afterthought on a bigger network.
                Purpose-built, here, for the exporters, the growers, the manufacturers, and the
                logistics teams who move Africa forward.
              </p>

              {/* Trust & certifications strip */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  'IATA Member',
                  'IOSA Certified',
                  'EASA Approved',
                  'ISAGO Certified',
                  'Qatar Airways Partner',
                ].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold"
                        style={{ background: 'var(--wb-sky-light)', color: 'var(--wb-blue)' }}>
                    ✓ {label}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold italic" style={{ color: 'var(--wb-gray-500)' }}>
                One of Africa&apos;s youngest, most modern fleets.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  { icon: Zap,           title: 'Live intelligence',         desc: 'Every shipment tracked, every sensor active, every alert instant. Africa\'s cargo doesn\'t go dark.' },
                  { icon: Package,       title: 'Smarter consolidation',     desc: 'African shippers on the same route, matched by our engine. Move more, spend less.' },
                  { icon: Shield,        title: 'Cold-chain built for Africa', desc: 'Rwanda\'s harvest has a 14-hour window. We protect every minute of it.' },
                  { icon: Leaf,          title: 'Green by default',          desc: 'Every tonne of African cargo moves carbon-neutral. No opt-in. No extra cost. Just done.' },
                  { icon: MessageCircle, title: 'WhatsApp alerts',           desc: 'Because Africa runs on WhatsApp. Every update, on the platform your team already uses.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                         style={{ background: 'var(--wb-sky-light)' }}>
                      <Icon className="w-5 h-5" style={{ color: 'var(--wb-sky)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-0.5" style={{ color: 'var(--wb-blue)' }}>{title}</p>
                      <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rwanda exports — standalone brand statement */}
              <div className="mt-10 rounded-xl px-6 py-6"
                   style={{
                     background: 'rgba(228,220,31,0.07)',
                     border: '1px solid rgba(228,220,31,0.3)',
                     borderLeft: '4px solid var(--wb-yellow)',
                   }}>
                <p className="text-lg font-bold leading-snug" style={{ color: 'var(--wb-blue)' }}>
                  Rwanda&apos;s flowers reach Amsterdam in 14 hours.
                </p>
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--wb-gray-900)' }}>
                  Because every African grower deserves a world-class export channel.
                </p>
                <p className="text-xs mt-3 font-semibold italic" style={{ color: 'var(--wb-gray-500)' }}>
                  Built to move Africa.
                </p>
              </div>
            </div>

            {/* KPI cards */}
            <div className="space-y-4">
              {[
                { label: 'On-time performance',              value: '98.2%', badge: '+1.2% vs last month' },
                { label: 'Consolidation savings avg.',       value: '21%',   badge: 'this quarter' },
                { label: 'Perishables cold-chain integrity', value: '99.7%', badge: 'maintained' },
                { label: 'Avg. quote generation time',       value: '< 30s', badge: 'AI-powered' },
                { label: 'Active route network',             value: '40+',   badge: 'destinations' },
              ].map(({ label, value, badge }) => (
                <div key={label} className="flex items-center justify-between p-5 rounded-xl"
                     style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
                    <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--wb-blue)' }}>{value}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--wb-green-light)', color: '#4a7c20' }}>
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Flying Green ─────────────────────────────────────────────────── */}
      <section className="py-20 pb-20 lg:pb-20" style={{ background: '#f0f9e8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                   style={{ background: 'rgba(148,201,67,0.15)', border: '1px solid rgba(148,201,67,0.3)' }}>
                <Leaf className="w-3.5 h-3.5" style={{ color: '#4a7c20' }} />
                <span className="text-xs font-semibold" style={{ color: '#4a7c20' }}>Carbon-neutral. By default.</span>
              </div>
              <h2 style={{ color: 'var(--wb-blue)' }}>Africa moves green</h2>
              <p className="mt-4 text-base" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.75 }}>
                Africa moves green — and the world notices. Every booking on RwandAir Cargo includes an
                automatic CO₂ offset at zero extra cost. Your cargo moves carbon-neutral from Kigali.
                European shippers receive a certified carbon certificate that meets EU CBAM and CSRD
                reporting requirements — automatically.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'CO₂ offset included on every booking',    icon: '✓' },
                  { label: 'Carbon certificate issued automatically',  icon: '✓' },
                  { label: 'Verified by Patch.io (Gold Standard)',     icon: '✓' },
                  { label: 'EU CBAM reporting data included',          icon: '✓' },
                ].map(({ label, icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: 'rgba(148,201,67,0.2)', color: '#4a7c20' }}>
                      {icon}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <Link href="/quote"
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: 'var(--wb-green)', color: 'white' }}>
                <Leaf className="w-4 h-4" /> Get a green quote
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '1,240t', label: 'CO₂ offset this quarter',       sub: 'equiv. 5,400 trees',       icon: '🌳' },
                { value: '100%',   label: 'Of bookings include offset',     sub: 'automatic, no opt-in needed', icon: '♻' },
                { value: '$0',     label: 'Extra cost to shipper',          sub: 'fully absorbed by RwandAir', icon: '🎁' },
                { value: '24h',    label: 'Certificate delivery',           sub: 'emailed on booking confirm', icon: '📄' },
              ].map(({ value, label, sub, icon }) => (
                <div key={label} className="p-5 rounded-xl"
                     style={{ background: 'white', border: '1px solid #c8e6a0' }}>
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="text-xl font-bold" style={{ color: 'var(--wb-blue)' }}>{value}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--wb-gray-900)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--wb-gray-500)' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 pb-20 lg:pb-20" style={{ background: 'var(--wb-blue)' }}>
        <ImigongoPattern color="white" opacity={0.04} />
        <ConnectivityLines opacity={0.08} variant="light" animated={false} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold mb-3 italic" style={{ color: 'var(--wb-yellow)', letterSpacing: '0.02em' }}>
            From Africa, for the world — and back again.
          </p>
          <h2 className="text-white mb-4">Africa&apos;s cargo is ready to move. Are you?</h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
            Get an instant quote in seconds, or speak directly with our 24/7 cargo desk.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote"
                  className="px-8 py-3 rounded-full font-bold text-sm"
                  style={{ background: 'var(--wb-yellow)', color: 'var(--wb-blue)' }}>
              Get instant quote
            </Link>
            <a href="tel:+250788177000"
               className="px-8 py-3 rounded-full font-bold text-sm border"
               style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.08)' }}>
              Call cargo desk
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
