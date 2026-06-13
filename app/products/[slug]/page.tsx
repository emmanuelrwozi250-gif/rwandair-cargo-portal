'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, ChevronRight, Thermometer, Shield, Zap,
  Heart, Star, Package, AlertTriangle, Leaf, CheckCircle,
  Truck, Box, Warehouse, Plane,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── Product definitions ──────────────────────────────────────────────────────
// Slugs deliberately match the homepage service-grid hrefs for consistency
const PRODUCTS = {
  'general-cargo': {
    name: 'WB General',
    tagline: 'Standard cargo, all 40+ routes',
    description: 'Competitive, reliable general cargo across all RwandAir routes. Consolidation matching available to save up to 25% — our AI engine groups compatible shipments daily.',
    color: '#00529C',
    bgColor: 'rgba(4,84,155,0.06)',
    icon: Package,
    badge: 'All routes',
    keyFeatures: [
      'Coverage across all 40+ active routes',
      'Guaranteed space with full track & trace',
      'Instant online quote in under 30 seconds',
      'Volumetric weight calculator built-in',
      'Packing list upload with AI data extraction',
      'WhatsApp status updates at every milestone',
    ],
    commodities: ['Apparel & textiles', 'Non-perishable food', 'Industrial goods', 'Consumer products', 'E-commerce goods'],
    tempRange: 'Ambient (2°C–25°C hold)',
    maxTransit: 'Route-dependent (11–48h)',
    certifications: ['IATA e-AWB', 'IOSA', 'ISAGO'],
    rateNote: 'Standard rate — most competitive on KGL hub routes',
  },
  'perishables': {
    name: 'WB Fresh',
    tagline: 'Temperature-controlled perishables',
    description: 'Dedicated cold-chain solution for fresh flowers, fruit, vegetables, and any temperature-sensitive cargo. Active IoT sensor monitoring throughout the journey with proactive shelf-life alerts.',
    color: '#94C944',
    bgColor: 'rgba(45,125,70,0.08)',
    icon: Thermometer,
    badge: '±2°C monitoring',
    keyFeatures: [
      'Active IoT temperature monitoring every 15 minutes',
      'Shelf-life calculation on every booking',
      'Proactive reroute recommendation if temperature excursion',
      'Cold-chain breaks reported in real-time via WhatsApp',
      'Dedicated cold-store at KGL, LHR, CDG, BRU, DXB',
      'HACCP-certified handlers at all hub connections',
    ],
    commodities: ['Cut flowers (roses, tulips, orchids)', 'Vegetables', 'Avocado', 'Fresh fruit', 'Fish & seafood (with cooling)'],
    tempRange: '0°C to 8°C (configurable per commodity)',
    maxTransit: '48h door-to-door (Europe)',
    certifications: ['HACCP', 'IATA Perishable Cargo Regulations', 'CEIV Fresh eligible'],
    rateNote: '+31% cold-chain surcharge on base rate',
  },
  'pharmaceuticals': {
    name: 'WB Pharma',
    tagline: 'GDP-certified pharmaceutical cold chain',
    description: 'Full Good Distribution Practice (GDP) compliance for pharmaceuticals, vaccines, and biological materials. ±2°C/±8°C passive or active temperature control with unbroken data logging.',
    color: '#16A1DC',
    bgColor: 'rgba(28,163,219,0.08)',
    icon: Shield,
    badge: 'GDP certified',
    keyFeatures: [
      'GDP-compliant handling at all hub stations',
      'Continuous temperature data logger (ELPRO / Sensitech)',
      'Dedicated pharma cold-rooms at KGL and LHR',
      'Separate loading and off-loading procedures',
      'Chain of custody documentation included',
      'Excursion reporting within 15 minutes of breach',
    ],
    commodities: ['Vaccines & biologicals', 'Oncology drugs', 'Clinical trial material', 'Blood & plasma', 'Diagnostics kits'],
    tempRange: '2°C to 8°C (CRT: 15°C–25°C also available)',
    maxTransit: 'Up to 96h with pre-conditioned shippers',
    certifications: ['IATA CEIV Pharma', 'GDP Guidelines (WHO/EU)', 'IOSA'],
    rateNote: '+55% GDP surcharge on base rate',
  },
  'dangerous-goods': {
    name: 'WB DG',
    tagline: 'IATA DGR compliant dangerous goods',
    description: 'Safe, fully compliant handling of IATA Dangerous Goods across both passenger and freighter aircraft. Trained DG specialists, correct documentation, and real-time regulatory guidance at booking.',
    color: '#DC2626',
    bgColor: 'rgba(220,38,38,0.07)',
    icon: AlertTriangle,
    badge: 'IATA DGR',
    keyFeatures: [
      'IATA Dangerous Goods Regulations (DGR) full compliance',
      'Online DG declaration wizard — catches errors before submission',
      'Trained DG acceptance agents at KGL',
      'CAO (Cargo Aircraft Only) and PAX aircraft options',
      'Packing, labelling, and quantity verification at acceptance',
      'Regulatory update alerts pushed to your account',
    ],
    commodities: ['Lithium batteries (UN 3480/3481)', 'Infectious substances (Cat A & B)', 'Dry ice', 'Aerosols & flammables', 'Radioactive materials (Class 7)'],
    tempRange: 'Per DGR classification (ambient or controlled)',
    maxTransit: 'Next available compliant departure',
    certifications: ['IATA DGR Edition 65+', 'IOSA', 'EASA ADR aligned'],
    rateNote: '+40% DG surcharge (varies by UN class)',
  },
  'live-animals': {
    name: 'WB Live',
    tagline: 'Live animals — IATA LAR compliant',
    description: 'Dedicated live animal transportation under full IATA Live Animals Regulations compliance. Climate-controlled holds, welfare inspections, and certified handlers at all stations.',
    color: '#EC4899',
    bgColor: 'rgba(236,72,153,0.08)',
    icon: Heart,
    badge: 'IATA LAR compliant',
    keyFeatures: [
      'IATA Live Animals Regulations (LAR) full compliance',
      'Certified animal handlers at KGL and all hub stations',
      'Climate-controlled and pressurised hold space',
      'Welfare check at every stopover',
      'Approved container and crate specifications',
      'Species-specific routing advice from booking team',
    ],
    commodities: ['Dogs & cats (pets)', 'Zoo animals', 'Day-old chicks', 'Tropical fish', 'Horses (select routes)'],
    tempRange: 'Species-appropriate (hold climate control)',
    maxTransit: 'Route-dependent (max 24h for most species)',
    certifications: ['IATA LAR Edition 45+', 'CITES Compliant', 'IOSA'],
    rateNote: '+82% AVI surcharge on base rate',
  },
  'valuable-goods': {
    name: 'WB Valuables',
    tagline: 'High-value cargo, vault-secured',
    description: 'Maximum-security handling for jewellery, currency, art, and high-value electronics. Dual-lock vault storage, GPS tracking, and optional security escort from collection to delivery.',
    color: '#7C3AED',
    bgColor: 'rgba(124,58,237,0.07)',
    icon: Star,
    badge: 'Security escort',
    keyFeatures: [
      'Dual-lock bonded vault storage at KGL',
      'GPS tracking with 10-minute polling',
      'Security escort available for shipments over $250k',
      'Armoured vehicle collection and delivery (select cities)',
      'Discrete packaging and documentation',
      'Insurance certificate coordination available',
    ],
    commodities: ['Jewellery & precious metals', 'Banknotes & currency', 'Luxury goods', 'High-value electronics', 'Artwork & antiques'],
    tempRange: 'Ambient (humidity-controlled vault available)',
    maxTransit: 'Next available direct flight',
    certifications: ['IATA Resolution 600 compliant', 'IOSA', 'C-TPAT aligned'],
    rateNote: '+64% security surcharge on base rate',
  },
  'human-remains': {
    name: 'WB Mortal Remains',
    tagline: 'Handled with care and full discretion',
    description: 'Respectful, professional handling of human remains with complete documentation support. Our trained staff liaise with families, funeral homes, and authorities at both origin and destination.',
    color: '#6B7280',
    bgColor: 'rgba(107,114,128,0.07)',
    icon: Leaf,
    badge: 'Full discretion',
    keyFeatures: [
      'Dedicated compassionate handling team at KGL',
      'Full documentation support — death certificate, embalming cert, consular letters',
      'Coordination with funeral homes at destination',
      'Discrete, respectful handling at all transit points',
      'Priority offload and authority notification on arrival',
      'Family liaison officer available on request',
    ],
    commodities: ['Embalmed remains', 'Cremated remains (ashes)', 'Foetal remains', 'Anatomical specimens (research)'],
    tempRange: 'Specific hold allocation per IATA regulations',
    maxTransit: 'Next available flight on requested route',
    certifications: ['IATA Resolution 600e', 'ICAO Annex 9', 'IOSA'],
    rateNote: 'Fixed compassionate rate — contact reservations for pricing',
  },
  'parcels': {
    name: 'WB Parcels',
    tagline: 'Door-to-door parcel delivery',
    description: 'Reliable, affordable parcel delivery across all RwandAir routes. From small e-commerce packages to multi-piece shipments — tracked end-to-end with AWB 459 number assigned at booking.',
    color: '#F97316',
    bgColor: 'rgba(249,115,22,0.07)',
    icon: Box,
    badge: 'Full track & trace',
    keyFeatures: [
      'AWB 459 number assigned instantly at booking',
      'Full track & trace via web, WhatsApp, or API',
      'Competitive per-kg rate for parcels under 30kg',
      'Maximum dimensions: 120 × 80 × 80 cm per piece',
      'Consolidation-eligible for regular e-commerce shippers',
      'Customs documentation assistance for international parcels',
    ],
    commodities: ['E-commerce packages', 'Documents & contracts', 'Samples & prototypes', 'Clothing & accessories', 'Small electronics'],
    tempRange: 'Ambient',
    maxTransit: 'Route-dependent (typically 24–72h)',
    certifications: ['IATA e-AWB', 'IOSA', 'UPU aligned'],
    rateNote: 'From $4.50/kg — instant online quote available',
  },
  'courier': {
    name: 'WB Courier',
    tagline: 'Express document & small package courier',
    description: 'Same-day and next-flight-out courier service for documents, samples, and urgent small packages. Guaranteed space on the next departing RwandAir flight with door-to-airport hand-delivery.',
    color: '#0891B2',
    bgColor: 'rgba(8,145,178,0.07)',
    icon: Truck,
    badge: 'Next-flight-out',
    keyFeatures: [
      'Book up to 2 hours before departure',
      'Guaranteed space — no offload risk',
      'Door-to-airport collection across Kigali (same day)',
      'Ground partner delivery at destination airport',
      'Digital POD (proof of delivery) with timestamp',
      'WhatsApp tracking notification at every milestone',
    ],
    commodities: ['Legal & financial documents', 'Passports & visas', 'Medical samples & biopsies', 'Spare parts (small)', 'Jewellery & watches (under 1kg)'],
    tempRange: 'Ambient (cold courier available on request)',
    maxTransit: 'Next available departure — typically same day',
    certifications: ['IATA e-AWB', 'IOSA', 'Data protection compliant'],
    rateNote: 'From $18 flat rate (under 0.5kg) — online booking',
  },
  'cargo-handling': {
    name: 'KGL Cargo Handling',
    tagline: 'ISAGO-certified ground handling at Kigali',
    description: 'RwandAir Cargo provides full cargo ground handling services at Kigali International Airport for third-party airlines and freight forwarders. ISAGO-certified, with dedicated freighter ramp and cold-chain facilities.',
    color: '#475569',
    bgColor: 'rgba(71,85,105,0.07)',
    icon: Warehouse,
    badge: 'ISAGO certified',
    keyFeatures: [
      'Ramp handling for freighter and passenger aircraft',
      'ULD build-up, breakdown, and storage management',
      'Full cargo acceptance, screening, and documentation',
      'Dedicated cold-chain facility — 400m² at +2°C to +8°C',
      'Dangerous goods acceptance and segregation',
      'Third-party airline handling contracts available',
    ],
    commodities: ['Third-party airline cargo', 'Transit cargo', 'Import / export general cargo', 'Cold-chain goods', 'Dangerous goods (CAO / PAX)'],
    tempRange: 'Full range — ambient, +2°C to +8°C, and -18°C cold-store',
    maxTransit: 'Ground handling only (inbound / outbound)',
    certifications: ['ISAGO', 'IATA Ground Operations Manual (IGOM)', 'RwandAir SMS compliant', 'Rwanda CAA licensed'],
    rateNote: 'Ground handling rates on request — SLA contracts available',
  },
  'charter': {
    name: 'WB Charter',
    tagline: 'Full aircraft charter from Kigali',
    description: 'Dedicated freighter or passenger-combi charter for large, time-sensitive, or specialised cargo. RwandAir operates Boeing 737-800F freighters with up to 22,000kg payload and flexible routing across Africa, the Middle East, and Europe.',
    color: '#1D4ED8',
    bgColor: 'rgba(29,78,216,0.07)',
    icon: Plane,
    badge: 'B737-800F available',
    keyFeatures: [
      'Boeing 737-800F — up to 22,000kg payload',
      'Flexible routing: any ICAO airport in our network',
      'Response within 2 hours for urgent charter requests',
      'Dedicated charter operations team based in Kigali',
      'Passenger-combi configuration available on request',
      'Humanitarian, mining, oil & gas, and outsized specialists',
    ],
    commodities: ['Humanitarian aid & relief cargo', 'Mining & drilling equipment', 'Livestock (full aircraft)', 'Automotive & machinery', 'Outsized or indivisible cargo'],
    tempRange: 'Configurable per commodity and route',
    maxTransit: 'On-demand — departs within 12–24h of confirmation',
    certifications: ['IOSA', 'EASA', 'Rwanda CAA AOC', 'IATA Standard'],
    rateNote: 'Charter rates on request — submit enquiry for 2-hour response',
  },
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const params  = useParams()
  const slug    = params?.slug as string
  const product = PRODUCTS[slug as keyof typeof PRODUCTS]

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="pt-16 min-h-screen flex items-center justify-center"
             style={{ background: 'var(--wb-gray-50)' }}>
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--wb-gray-200)' }} />
            <h2 style={{ color: 'var(--wb-blue)' }}>Product not found</h2>
            <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm font-bold"
                  style={{ color: 'var(--wb-sky)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const Icon = product.icon

  return (
    <>
      <Navbar />
      <div className="pt-16" style={{ background: 'var(--wb-gray-50)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ background: product.color }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm mb-6"
                  style={{ color: 'rgba(255,255,255,0.7)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-white" style={{ fontSize: '2rem' }}>{product.name}</h1>
                  <span className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                    {product.badge}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem' }}>{product.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="rounded-2xl p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h2 className="mb-4" style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>About {product.name}</h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--wb-gray-500)' }}>
                  {product.description}
                </p>
              </div>

              {/* Key features */}
              <div className="rounded-2xl p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h2 className="mb-5" style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.keyFeatures.map(f => (
                    <div key={f} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: product.color }} />
                      <span className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted commodities */}
              <div className="rounded-2xl p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h2 className="mb-5" style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>Accepted Commodities</h2>
                <div className="flex flex-wrap gap-2">
                  {product.commodities.map(c => (
                    <span key={c} className="text-sm px-3 py-1.5 rounded-full font-semibold"
                          style={{ background: product.bgColor, color: product.color }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="rounded-2xl p-8"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h2 className="mb-5" style={{ color: 'var(--wb-blue)', fontSize: '1.25rem' }}>Certifications &amp; Standards</h2>
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map(c => (
                    <span key={c} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: 'rgba(0,80,158,0.07)', color: 'var(--wb-blue)' }}>
                      <Shield className="w-3.5 h-3.5 shrink-0" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Quick specs */}
              <div className="rounded-2xl p-6 sticky top-24"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <h3 className="mb-4" style={{ color: 'var(--wb-blue)' }}>Quick specs</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Temperature range', value: product.tempRange },
                    { label: 'Max transit', value: product.maxTransit },
                    { label: 'Pricing', value: product.rateNote },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--wb-gray-500)' }}>{label}</p>
                      <p className="text-sm" style={{ color: 'var(--wb-gray-900)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <Link href="/quote"
                        className="w-full block text-center py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: product.color, color: 'white' }}>
                    Get a {product.name} quote
                  </Link>
                  <a href="mailto:cargobooking@rwandair.com"
                     className="w-full block text-center py-3 rounded-xl font-bold text-sm border transition-all hover:opacity-90"
                     style={{ borderColor: product.color, color: product.color, background: product.bgColor }}>
                    Contact cargo desk <ChevronRight className="inline w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Other products */}
              <div className="rounded-2xl p-6"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--wb-gray-500)' }}>Other products</p>
                <div className="space-y-1.5">
                  {Object.entries(PRODUCTS).filter(([s]) => s !== slug).map(([s, p]) => {
                    const PIcon = p.icon
                    return (
                      <Link key={s} href={`/products/${s}`}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all hover:opacity-80"
                            style={{ background: p.bgColor }}>
                        <PIcon className="w-4 h-4 shrink-0" style={{ color: p.color }} />
                        <span className="text-sm font-semibold" style={{ color: p.color }}>{p.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
