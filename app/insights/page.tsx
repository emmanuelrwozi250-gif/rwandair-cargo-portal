import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Rwanda Trade Insights | RwandAir Cargo',
  description: 'Market updates, regulatory alerts, and trade intelligence from Kigali Hub.',
}

const ARTICLES = [
  {
    slug: 'rwanda-horticultural-exports-2025',
    title: "Rwanda's horticultural exports up 34% YoY — what it means for air cargo capacity",
    date: 'March 18, 2026',
    category: 'Market Update',
    categoryColor: '#94C944',
    categoryBg: 'rgba(45,125,70,0.1)',
    excerpt: "Rwanda's National Agricultural Export Development Board reports record horticultural export volumes for Q1 2026, driven by strong European demand for roses and avocados. We examine what this means for belly space availability on the KGL–AMS and KGL–CDG corridors over the next quarter.",
  },
  {
    slug: 'eu-cbam-east-africa-exporters',
    title: 'EU CBAM regulation 2026: what East African exporters need to know',
    date: 'March 10, 2026',
    category: 'Regulatory',
    categoryColor: '#DC2626',
    categoryBg: 'rgba(220,38,38,0.08)',
    excerpt: "The EU Carbon Border Adjustment Mechanism enters its definitive phase in 2026, affecting exports of steel, aluminium, cement, fertilisers and electricity. East African exporters shipping to Europe should understand their reporting obligations and how carbon-offset cargo programmes can support compliance.",
  },
  {
    slug: 'cold-chain-pharma-routes-rwandair',
    title: 'Cold-chain innovations: how RwandAir Cargo achieves 99.7% integrity on pharma routes',
    date: 'February 28, 2026',
    category: 'Cold Chain',
    categoryColor: '#16A1DC',
    categoryBg: 'rgba(28,163,219,0.1)',
    excerpt: "Our CEIV Pharma certification demands real-time IoT temperature monitoring at every stage — from acceptance at KGL to final delivery. In this piece, our cargo operations team explains the technology stack and protocols that underpin our cold-chain performance record.",
  },
]

export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        {/* Hero */}
        <div className="py-16" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Intelligence</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800 }}>
              Rwanda Trade Insights
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '560px' }}>
              Market updates, regulatory alerts, and trade intelligence from Kigali Hub.
            </p>
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.map(({ slug, title, date, category, categoryColor, categoryBg, excerpt }) => (
              <article key={slug} className="rounded-2xl overflow-hidden flex flex-col"
                       style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                {/* Category colour bar */}
                <div className="h-1" style={{ background: categoryColor }} />
                <div className="p-7 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: categoryBg, color: categoryColor }}>
                      {category}
                    </span>
                    <time className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{date}</time>
                  </div>
                  <h2 className="font-bold text-base leading-snug" style={{ color: 'var(--wb-blue)' }}>
                    {title}
                  </h2>
                  <p className="text-sm flex-1" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>
                    {excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold"
                        style={{ color: 'var(--wb-sky)' }}>
                    Read more <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-14">
            <p className="text-sm mb-4" style={{ color: 'var(--wb-gray-500)' }}>
              Subscribe to receive trade intelligence in your inbox
            </p>
            <a href="mailto:cargo@rwandair.com?subject=Trade Insights Newsletter"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm"
               style={{ background: 'var(--wb-blue)', color: 'white' }}>
              Subscribe to insights
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
