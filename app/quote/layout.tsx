import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get a Cargo Quote | RwandAir Cargo',
  description:
    'Get instant air cargo quotes for 40+ destinations from Kigali. Compare fastest, cheapest and most reliable routing options with live CO₂ estimates.',
  openGraph: {
    title: 'Get a Cargo Quote | RwandAir Cargo',
    description:
      'Get instant air cargo quotes for 40+ destinations from Kigali. Compare fastest, cheapest and most reliable routing options with live CO₂ estimates.',
    url: '/quote',
  },
  alternates: {
    canonical: '/quote',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
