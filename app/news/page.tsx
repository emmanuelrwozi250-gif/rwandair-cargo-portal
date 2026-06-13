import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import ArticleGrid from '@/components/news/ArticleGrid'
import ServiceAlertBar from '@/components/news/ServiceAlertBar'
import SubscribeBox from '@/components/news/SubscribeBox'
import { fetchArticles, fetchActiveServiceAlerts } from '@/lib/news'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'News & Updates',
  description:
    'Route news, service alerts, trade intelligence, and compliance updates from RwandAir Cargo — Africa\'s cargo hub at Kigali.',
  alternates: { canonical: '/news' },
}

export default async function NewsHubPage() {
  const [articles, alerts] = await Promise.all([fetchArticles(), fetchActiveServiceAlerts()])
  const featured = articles.find(a => !a.is_service_alert)
  const rest = articles.filter(a => a.id !== featured?.id)

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        <ServiceAlertBar alerts={alerts} />

        {/* Hero */}
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="label-upper mb-3" style={{ color: 'var(--wb-sky)' }}>Newsroom</p>
            <h1 className="text-white mb-4" style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 800 }}>
              News &amp; Updates
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '560px' }}>
              Operational alerts, route developments, and trade intelligence from Kigali Hub —
              written by the team that moves the cargo.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {articles.length === 0 ? (
            <p className="text-sm text-center py-20" style={{ color: 'var(--wb-gray-500)' }}>
              Articles are being prepared — subscribe below and we&apos;ll let you know the moment
              the first one lands.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                {featured && (
                  <section aria-label="Featured article">
                    <ArticleCard article={featured} featured />
                  </section>
                )}
                <section aria-label="All articles">
                  <ArticleGrid articles={rest} />
                </section>
              </div>

              {/* Sidebar */}
              <aside className="space-y-6 lg:sticky lg:top-24 self-start">
                <SubscribeBox />
                <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
                  <p className="text-sm font-bold mb-2" style={{ color: 'var(--wb-blue)' }}>
                    Prefer WhatsApp?
                  </p>
                  <p className="text-xs mb-4" style={{ color: 'var(--wb-gray-500)', lineHeight: 1.6 }}>
                    Get service alerts straight to your phone — message our cargo desk and ask
                    for news opt-in.
                  </p>
                  <a href="https://wa.me/250788177000?text=Please%20opt%20me%20in%20to%20RwandAir%20Cargo%20news%20alerts"
                     target="_blank" rel="noopener noreferrer"
                     className="inline-flex px-4 py-2 rounded-full text-xs font-bold"
                     style={{ background: '#25D366', color: 'white' }}>
                    Opt in via WhatsApp
                  </a>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
