import type { MetadataRoute } from 'next'
import { fetchArticles, ARTICLE_CATEGORIES } from '@/lib/news'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rwandair-cargo-portal-nnvj.vercel.app'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                               lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/quote`,                    lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/track`,                    lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/consolidate`,              lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/capacity`,                 lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/deals`,                    lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/perishables`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/stations`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/agents`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/integrations`,             lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/api-docs`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/legal/service-guarantee`,  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/news`,                     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/claims`,                   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/reviews`,                  lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/feedback`,                 lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const productSlugs = [
    'general-cargo', 'perishables', 'pharmaceuticals',
    'dangerous-goods', 'live-animals', 'valuable-goods',
    'human-remains', 'parcels', 'courier',
    'cargo-handling', 'charter',
  ]
  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(slug => ({
    url: `${SITE_URL}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // News categories are indexable (not noindex) per editorial SEO requirements
  const categoryRoutes: MetadataRoute.Sitemap = Object.values(ARTICLE_CATEGORIES).map(meta => ({
    url: `${SITE_URL}/news/category/${meta.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }))

  // Updated on publish via ISR (revalidate above)
  const articles = await fetchArticles({ limit: 500 })
  const articleRoutes: MetadataRoute.Sitemap = articles.map(a => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...articleRoutes]
}
