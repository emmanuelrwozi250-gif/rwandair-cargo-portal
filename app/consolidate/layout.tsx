import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cargo Consolidation | RwandAir Cargo',
  description:
    'Join a consolidation group and save up to 25% on air freight costs. Our AI matches your cargo with compatible shipments on the same route.',
  openGraph: {
    title: 'Cargo Consolidation | RwandAir Cargo',
    description:
      'Join a consolidation group and save up to 25% on air freight costs. Our AI matches your cargo with compatible shipments on the same route.',
    url: '/consolidate',
  },
  alternates: {
    canonical: '/consolidate',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
