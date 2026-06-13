import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ArticleCard, { CategoryPill } from '@/components/news/ArticleCard'
import UsefulVote from '@/components/news/UsefulVote'
import { fetchArticleBySlug, fetchRelatedArticles, readingTimeMinutes, ARTICLE_CATEGORIES } from '@/lib/news'
import { Mail, Linkedin, MessageCircle, ChevronLeft, Clock } from 'lucide-react'

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rwandair-cargo-portal-nnvj.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  if (!article) return { title: 'Article not found' }

  const url = `${SITE_URL}/news/${article.slug}`
  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      url,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author_name],
      images: article.hero_image_url ? [{ url: article.hero_image_url, width: 1200, height: 630, alt: article.hero_image_alt ?? article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.hero_image_url ? [article.hero_image_url] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await fetchArticleBySlug(slug)
  if (!article) notFound()

  const related = await fetchRelatedArticles(article)
  const html = await marked.parse(article.body)
  const url = `${SITE_URL}/news/${article.slug}`
  const meta = ARTICLE_CATEGORIES[article.category]
  const dateLong = new Date(article.published_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // Google News structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: article.author_name, jobTitle: article.author_role },
    publisher: {
      '@type': 'Organization',
      name: 'RwandAir Cargo',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    image: article.hero_image_url ? [article.hero_image_url] : undefined,
    mainEntityOfPage: url,
  }

  const shareText = encodeURIComponent(`${article.title} — RwandAir Cargo`)
  const shareUrl = encodeURIComponent(url)

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="pt-16" style={{ background: 'var(--neutral-light)' }}>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/news" className="inline-flex items-center gap-1 text-sm font-semibold mb-6"
                style={{ color: 'var(--wb-sky)' }}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" /> All news
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <CategoryPill category={article.category} />
            <time dateTime={article.published_at} className="text-sm" style={{ color: 'var(--wb-gray-500)' }}>
              {dateLong}
            </time>
            <span className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--wb-gray-500)' }}>
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {readingTimeMinutes(article.body)} min read
            </span>
          </div>

          <h1 className="mb-5" style={{ color: 'var(--wb-blue)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, lineHeight: 1.15 }}>
            {article.title}
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-3 pb-6 mb-6" style={{ borderBottom: '1px solid var(--wb-gray-200)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                 style={{ background: meta.bg, color: meta.color }} aria-hidden="true">
              {article.author_name.split(/\s+/).map(p => p[0]).slice(0, 2).join('')}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--wb-blue)' }}>{article.author_name}</p>
              <p className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>{article.author_role}</p>
            </div>
          </div>

          {article.hero_image_url && (
            <div className="relative w-full rounded-2xl overflow-hidden mb-8" style={{ aspectRatio: '1200 / 630' }}>
              <Image src={article.hero_image_url} alt={article.hero_image_alt ?? ''} fill priority
                     sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
            </div>
          )}

          <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />

          {article.related_routes.length > 0 && (
            <p className="mt-8 text-xs font-semibold" style={{ color: 'var(--wb-gray-500)' }}>
              Related routes: {article.related_routes.join(' · ')}
            </p>
          )}

          {/* Share — WhatsApp, LinkedIn, Email */}
          <div className="flex flex-wrap items-center gap-3 mt-8 mb-8">
            <span className="text-sm font-semibold" style={{ color: 'var(--wb-gray-500)' }}>Share:</span>
            <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
               aria-label="Share on WhatsApp"
               className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
               style={{ background: '#25D366', color: 'white' }}>
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" /> WhatsApp
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer"
               aria-label="Share on LinkedIn"
               className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
               style={{ background: '#0A66C2', color: 'white' }}>
              <Linkedin className="w-3.5 h-3.5" aria-hidden="true" /> LinkedIn
            </a>
            <a href={`mailto:?subject=${shareText}&body=${shareUrl}`}
               aria-label="Share by email"
               className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
               style={{ background: 'var(--wb-blue)', color: 'white' }}>
              <Mail className="w-3.5 h-3.5" aria-hidden="true" /> Email
            </a>
          </div>

          <UsefulVote slug={article.slug} />
        </article>

        {/* Related articles */}
        {related.length > 0 && (
          <section aria-label="Related articles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--wb-blue)' }}>More {article.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
