import RouteGlobe from '@/components/globe/RouteGlobe'
import Navbar from '@/components/layout/Navbar'

export const metadata = {
  title: 'Route Map | RwandAir Cargo',
}

export default function GlobePage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '64px', background: 'var(--brand-blue)', minHeight: '100vh' }}>
        <div style={{ padding: '40px 0 0', textAlign: 'center' }}>
          <h1 style={{ color: '#FBE115', fontFamily: "'Lato', sans-serif", fontSize: '2rem', fontWeight: 900, marginBottom: 4 }}>
            Our Route Network
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Lato', sans-serif", fontSize: '1rem', marginBottom: 32 }}>
            Kigali hub connecting {14 + 28} destinations across Africa, Europe, Asia & the Americas
          </p>
        </div>
        <RouteGlobe height={640} />
      </main>
    </>
  )
}
