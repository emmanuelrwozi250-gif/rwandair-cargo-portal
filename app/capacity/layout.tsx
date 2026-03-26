import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Freighter Capacity | RwandAir Cargo',
  description: 'Real-time belly space availability across the RwandAir freighter network. Updated live with current cargo capacity on all key routes from Kigali.',
  alternates: { canonical: '/capacity' },
  openGraph: {
    title: 'Live Cargo Capacity | RwandAir Cargo',
    description: 'Check real-time freighter capacity on KGL routes. Plan your bookings with live belly space data.',
    url: '/capacity',
  },
}

export default function CapacityLayout({ children }: { children: React.ReactNode }) {
  return children
}
