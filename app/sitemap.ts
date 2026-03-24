import type { MetadataRoute } from 'next'

const SITE_URL = 'https://cargo.rwandair.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/quote`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/track`,         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/consolidate`,   lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/capacity`,      lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/deals`,         lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${SITE_URL}/perishables`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/stations`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/agent`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
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

  return [...staticRoutes, ...productRoutes]
}
