import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ExternalLink, Zap, Code } from 'lucide-react'

export const metadata = {
  title: 'Platform Integrations | RwandAir Cargo',
  description: 'Book RwandAir Cargo via cargo.one, WebCargo, CargoAi, Flexport, Freightos, CargoWise and more.',
}

const INTEGRATIONS = [
  {
    name: 'cargo.one',
    desc: 'The leading digital air cargo marketplace for freight forwarders — instant booking across 50+ airlines.',
    url: 'https://cargo.one',
    color: '#0060df',
  },
  {
    name: 'WebCargo',
    desc: 'Freightos Group platform with real-time rates, availability and eBooking for air and ocean freight.',
    url: 'https://www.webcargo.co',
    color: '#00a651',
  },
  {
    name: 'CargoAi',
    desc: 'AI-powered cargo booking platform providing instant quotes and capacity management.',
    url: 'https://cargo.ai',
    color: '#ff6b00',
  },
  {
    name: 'Flexport',
    desc: 'Global trade platform unifying freight forwarding, customs, and supply chain visibility.',
    url: 'https://www.flexport.com',
    color: '#00bfff',
  },
  {
    name: 'Freightos',
    desc: 'Digital freight marketplace for instant ocean, air and road freight quotes and booking.',
    url: 'https://www.freightos.com',
    color: '#6c3ce1',
  },
  {
    name: 'CargoWise',
    desc: 'Enterprise logistics software used by the world\'s largest freight forwarders and customs brokers.',
    url: 'https://www.cargowise.com',
    color: '#e63946',
  },
]

export default function IntegrationsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        {/* Hero */}
        <div className="py-16" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Integrations</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800 }}>
              Book via your preferred platform
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
              RwandAir Cargo is live on all major digital freight platforms. Book through the tool your team already uses.
            </p>
          </div>
        </div>

        {/* Platform cards */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {INTEGRATIONS.map(({ name, desc, url, color }) => (
              <div key={name} className="rounded-2xl p-7 flex flex-col gap-4"
                   style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                     style={{ background: color }}>
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold mb-1" style={{ color: 'var(--wb-blue)' }}>{name}</h3>
                  <p className="text-sm" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>{desc}</p>
                </div>
                <a href={url} target="_blank" rel="noopener noreferrer"
                   className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
                   style={{ color }}>
                  Book on {name} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          {/* Direct API section */}
          <div className="rounded-2xl p-10 text-center"
               style={{ background: 'var(--wb-blue-dark)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                 style={{ background: 'rgba(28,163,219,0.2)' }}>
              <Code className="w-6 h-6" style={{ color: 'var(--wb-sky)' }} />
            </div>
            <h2 className="text-white mb-3" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Direct API Access
            </h2>
            <p className="mb-6 mx-auto" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '520px' }}>
              Connect your own system directly to RwandAir Cargo via REST API. Access real-time capacity,
              rates, and booking — all in one integration.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:cargobooking@rwandair.com?subject=API Credentials Request"
                 className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm"
                 style={{ background: 'var(--wb-yellow)', color: 'var(--brand-blue)' }}>
                <Zap className="w-4 h-4" />
                Request API credentials
              </a>
              {/* TODO: link to real API docs when available */}
              <Link href="/api-docs"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm"
                    style={{ border: '1.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)' }}>
                <Code className="w-4 h-4" />
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
