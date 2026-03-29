import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Shield, Clock, Thermometer, FileText, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Service Guarantee & Claims | RwandAir Cargo',
  description: 'Our on-time delivery commitment, cold-chain integrity guarantee, and claims procedure.',
}

export default function ServiceGuaranteePage() {
  const sections = [
    {
      icon: Clock,
      title: 'On-Time Delivery Commitment',
      color: '#00529C',
      bg: 'rgba(4,84,155,0.07)',
      // TODO: legal team to complete
      content: [
        'RwandAir Cargo commits to delivering shipments within the transit times quoted at booking.',
        'In the event of a delay attributable to RwandAir Cargo, customers are entitled to a service credit as defined in our tariff schedule.',
        'Force majeure events (weather, ATC restrictions, government directives) are excluded from this commitment.',
      ],
    },
    {
      icon: Thermometer,
      title: 'Cold-Chain Integrity Guarantee',
      color: '#94C944',
      bg: 'rgba(45,125,70,0.08)',
      // TODO: legal team to complete
      content: [
        'Perishable and pharmaceutical shipments handled under active cold-chain protocols are monitored continuously from acceptance to delivery.',
        'Temperature excursions caused by RwandAir Cargo equipment failure entitle the shipper to a full cargo value claim (subject to declaration and IATA limits).',
        'Cold-chain integrity certificates are available on request for each shipment.',
      ],
    },
    {
      icon: FileText,
      title: 'Claims Procedure',
      color: '#16A1DC',
      bg: 'rgba(28,163,219,0.08)',
      // TODO: legal team to complete
      content: [
        'Claims for loss or damage must be submitted in writing within 14 days of delivery (or expected delivery for loss).',
        'Supporting documentation required: AWB copy, commercial invoice, packing list, damage/shortage report.',
        'Claims are processed within 30 business days of receiving complete documentation.',
        'Submit claims to: cargo@rwandair.com with subject "Cargo Claim — [AWB Number]".',
      ],
    },
    {
      icon: Shield,
      title: 'Liability Reference',
      color: '#7C3AED',
      bg: 'rgba(124,58,237,0.07)',
      // TODO: legal team to complete
      content: [
        'RwandAir Cargo liability is governed by the Montreal Convention 1999 and IATA Conditions of Contract.',
        'Maximum liability: 22 SDR per kilogram for checked baggage and cargo, unless a higher value is declared.',
        'Special drawing right (SDR) conversions are published by the International Monetary Fund.',
        'Declared value charges apply for shipments exceeding standard liability limits.',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Exclusions & Limitations',
      color: '#D97706',
      bg: 'rgba(217,119,6,0.08)',
      // TODO: legal team to complete
      content: [
        'RwandAir Cargo is not liable for inherent vice, improper packaging by shipper, or acts of third parties.',
        'Consequential or indirect losses are excluded from all claims.',
        'Live animals, human remains, and dangerous goods are subject to separate terms.',
        'Full terms and conditions are available at rwandair.com/cargo-terms.',
      ],
    },
  ]

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>
        {/* Hero */}
        <div className="py-16" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Legal</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              Service Guarantee &amp; Claims
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '600px' }}>
              Our commitments to on-time delivery, cold-chain integrity, and transparent claims handling.
              Last reviewed: {new Date().getFullYear()}.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          {sections.map(({ icon: Icon, title, color, bg, content }) => (
            <div key={title} className="rounded-2xl p-8"
                 style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--wb-blue)' }}>{title}</h2>
              </div>
              <ul className="space-y-3">
                {content.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="text-center pt-4">
            <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
              Questions about a claim or service issue?
            </p>
            <a href="mailto:cargo@rwandair.com"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm"
               style={{ background: 'var(--wb-blue)', color: 'white' }}>
              Contact Cargo Desk
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
