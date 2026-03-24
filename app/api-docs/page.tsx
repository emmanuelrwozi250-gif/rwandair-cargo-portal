import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Code, Zap } from 'lucide-react'

export const metadata = {
  title: 'API Documentation | RwandAir Cargo',
  description: 'Developer documentation for the RwandAir Cargo REST API.',
}

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen" style={{ background: 'var(--neutral-light)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
               style={{ background: 'rgba(4,84,155,0.1)' }}>
            <Code className="w-7 h-7" style={{ color: 'var(--wb-blue)' }} />
          </div>
          <h1 className="mb-4" style={{ color: 'var(--wb-blue)' }}>API Documentation</h1>
          <p className="text-lg mb-3" style={{ color: 'var(--wb-gray-500)' }}>Coming soon</p>
          <p className="text-sm mb-8" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.7 }}>
            Full REST API documentation for capacity queries, rate retrieval, and booking submission
            is under development. Request credentials now to join the early access programme.
          </p>
          {/* TODO: replace mailto with API portal link when ready */}
          <a href="mailto:cargobooking@rwandair.com?subject=API Early Access"
             className="inline-flex items-center gap-2 font-bold text-sm"
             style={{ background: 'var(--wb-yellow)', color: '#0A1F44', padding: '14px 28px', borderRadius: '8px' }}>
            <Zap className="w-4 h-4" />
            Request early access
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
