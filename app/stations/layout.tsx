import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cargo Station Directory | RwandAir Cargo',
  description:
    'Find handler details, cold-store facilities, and certifications at all 14 RwandAir Cargo stations across Africa, Europe, and the Middle East.',
  openGraph: {
    title: 'Cargo Station Directory | RwandAir Cargo',
    description:
      'Find handler details, cold-store facilities, and certifications at all 14 RwandAir Cargo stations across Africa, Europe, and the Middle East.',
    url: 'https://cargo.rwandair.com/stations',
  },
  alternates: {
    canonical: 'https://cargo.rwandair.com/stations',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
