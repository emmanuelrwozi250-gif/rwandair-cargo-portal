import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Last-Minute Cargo Deals | RwandAir Cargo',
  description:
    'Grab discounted empty belly space before tonight\'s flights. Save up to 30% on last-minute air cargo bookings from Kigali.',
  openGraph: {
    title: 'Last-Minute Cargo Deals | RwandAir Cargo',
    description:
      'Grab discounted empty belly space before tonight\'s flights. Save up to 30% on last-minute air cargo bookings from Kigali.',
    url: 'https://cargo.rwandair.com/deals',
  },
  alternates: {
    canonical: 'https://cargo.rwandair.com/deals',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
