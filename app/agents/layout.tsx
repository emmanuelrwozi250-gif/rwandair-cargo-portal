import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Freight Agents & Forwarders | RwandAir Cargo',
  description: 'Credit accounts, platform integrations, and a dedicated agent support line — purpose-built for professional intermediaries moving cargo through Kigali Hub.',
  alternates: { canonical: '/agents' },
  openGraph: {
    title: 'Freight Agent Portal | RwandAir Cargo',
    description: 'Join RwandAir Cargo\'s preferred freight agent network. Credit terms, named account managers, and live integrations with cargo.one, WebCargo, CargoAi & more.',
    url: '/agents',
  },
}

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
