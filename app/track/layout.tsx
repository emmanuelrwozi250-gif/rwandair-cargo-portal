import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Shipment | RwandAir Cargo',
  description:
    'Track your RwandAir Cargo shipment with your Air Waybill (AWB) number. Get real-time status, IoT sensor data, and delivery estimates.',
  openGraph: {
    title: 'Track Your Shipment | RwandAir Cargo',
    description:
      'Track your RwandAir Cargo shipment with your Air Waybill (AWB) number. Get real-time status, IoT sensor data, and delivery estimates.',
    url: '/track',
  },
  alternates: {
    canonical: '/track',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
