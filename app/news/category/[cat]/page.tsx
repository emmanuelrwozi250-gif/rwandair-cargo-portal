import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard from '@/components/news/ArticleCard'
import { fetchArticles, categoryFromSlug, ARTICLE_CATEGORIES } from '@/lib/news'
import { ChevronLeft } from 'lucide-react'

export const revalidate = 300

export function generateStaticParams() {
  return Object.values(ARTICLE_CATEGORIES).map(meta => ({ cat: meta.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params
  const category = categoryFromSlug(cat)
  if (!category) return { title: 'News category' }
  return {
    title: `${category} — News & Updates`,
    description: `${category} from RwandAir Cargo — Africa's cargo hub at Kigali.`,
    alternates: { canonical: `/news/category/${cat}` },
  }
}

export default async function NewsCategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params
  const category = categoryFromSlug(cat)
  if (!category) notFound()

  const articles = await fetchArticles({ category })
  const meta = ARTICLE_CATEGORIES[category]

  return (
    <>
      <Navbar />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>
        <div className="py-14" style={{ background: 'var(--wb-blue-dark)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold mb-4"
                  style={{ color: 'var(--wb-sky)' }}>
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> All news
            </Link>
            <h1 className="text-white" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800 }}>
              {category}
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {articles.length === 0 ? (
            <p className="text-sm text-center py-20" style={{ color: 'var(--wb-gray-500)' }}>
              Nothing published in {category} yet — the first article is on its way.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          )}
          <p className="text-xs mt-10" style={{ color: meta.color }}>
            Category: {category}
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
