import type { Metadata } from 'next'
import { Lato } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkipLink } from '@/components/ui/SkipLink'

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rwandair-cargo-portal-nnvj.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RwandAir Cargo — Built to Move Africa | From Kigali, For the World',
    template: '%s | RwandAir Cargo',
  },
  description: 'Africa\'s cargo, moving the world. Book from Kigali to 40+ destinations with real-time routing, cold-chain precision, and same-day quotes. Built to move Africa — from flower farms to pharmaceuticals. IATA · IOSA · EASA certified.',
  keywords: [
    'RwandAir Cargo', 'air cargo Africa', 'Kigali freight', 'cargo booking Rwanda',
    'perishables airfreight', 'cold chain cargo', 'pharmaceutical air cargo',
    'cargo consolidation', 'WB freighter', 'air cargo KGL', 'Africa cargo hub',
    'Rwanda exports airfreight', 'flowers cargo Kigali', 'cargo London Brussels Paris',
  ],
  authors: [{ name: 'RwandAir Cargo', url: SITE_URL }],
  creator: 'RwandAir Limited',
  publisher: 'RwandAir Limited',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: 'RwandAir Cargo',
    title: 'RwandAir Cargo — Built to Move Africa | From Kigali, For the World',
    description: 'Africa\'s cargo, moving the world. Rwanda\'s flowers, African pharmaceuticals, East African produce — lifted from Kigali to 40+ destinations with cold-chain precision. IATA · IOSA · EASA certified.',
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'RwandAir Cargo — Built to Move Africa. From Kigali, For the World.',
      },
    ],
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RwandAir Cargo — Built to Move Africa',
    description: 'Africa\'s cargo, moving the world. Rwanda\'s flowers to Amsterdam in 14 hours, African pharma, perishables & general cargo from Kigali.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  // verification: { google: 'paste-your-google-site-verification-token-here' },
}

// ─── Organization + AirlineService structured data ────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'RwandAir Cargo',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: 'RwandAir Cargo is the dedicated cargo division of RwandAir, Rwanda\'s national flag carrier, operating from Kigali International Airport to 40+ global destinations.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Kigali International Airport, Main Building',
        addressLocality: 'Kigali',
        addressCountry: 'RW',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+250-788-177-000',
          contactType: 'customer service',
          availableLanguage: ['English', 'French', 'Swahili'],
          contactOption: '24/7',
        },
        {
          '@type': 'ContactPoint',
          email: 'cargo@rwandair.com',
          contactType: 'cargo bookings',
        },
      ],
      sameAs: ['https://www.rwandair.com'],
    },
    {
      '@type': 'Service',
      '@id': `${SITE_URL}/#cargo-service`,
      name: 'RwandAir Cargo — Air Freight Service',
      provider: { '@id': `${SITE_URL}/#organization` },
      serviceType: 'Air Cargo / Air Freight',
      description: 'Air cargo services from Kigali (KGL) to Africa, Europe, Middle East, Asia, and the Americas. Specialties: perishables, pharmaceuticals, live animals, dangerous goods, and valuable cargo.',
      areaServed: [
        'Africa', 'Europe', 'Middle East', 'Asia', 'North America'
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'RwandAir Cargo Products',
        itemListElement: [
          { '@type': 'Offer', name: 'WB General — Standard Cargo' },
          { '@type': 'Offer', name: 'WB Fresh — Temperature-Controlled Perishables' },
          { '@type': 'Offer', name: 'WB Pharma — GDP-Certified Pharmaceuticals' },
          { '@type': 'Offer', name: 'WB Express — Same-Day Time-Critical Cargo' },
          { '@type': 'Offer', name: 'WB Live — Live Animals (IATA LAR)' },
          { '@type': 'Offer', name: 'WB Valuables — High-Value Vault-Secured Cargo' },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'RwandAir Cargo',
      description: 'Official cargo booking and intelligence platform for RwandAir Cargo',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/track/{awb}`,
        },
        'query-input': 'required name=awb',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${lato.variable} font-lato antialiased`} suppressHydrationWarning>
        <SkipLink />
        <LanguageProvider>
          <ToastProvider>
            <ErrorBoundary>
              <div id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
                {children}
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
