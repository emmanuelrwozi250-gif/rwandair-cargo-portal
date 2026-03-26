import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perishables Cargo — Cold Chain | RwandAir Cargo',
  description:
    'Temperature-controlled air cargo for flowers, fruit, vegetables, and pharmaceuticals from Rwanda. IoT monitoring, shelf-life calculations, GDP-certified cold chain.',
  openGraph: {
    title: 'Perishables Cargo — Cold Chain | RwandAir Cargo',
    description:
      'Temperature-controlled air cargo for flowers, fruit, vegetables, and pharmaceuticals from Rwanda. IoT monitoring, shelf-life calculations, GDP-certified cold chain.',
    url: '/perishables',
  },
  alternates: {
    canonical: '/perishables',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
