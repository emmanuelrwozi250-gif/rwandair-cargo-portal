import { createClient } from '@supabase/supabase-js'
import type { Article, ArticleCategory } from '@/types'

// Category colour system — consistent across hub, pills, and homepage banner
export const ARTICLE_CATEGORIES: Record<
  ArticleCategory,
  { slug: string; color: string; bg: string }
> = {
  'Route News':         { slug: 'route-news',         color: '#00529C', bg: 'rgba(0,82,156,0.08)' },
  'Service Alerts':     { slug: 'service-alerts',     color: '#B45309', bg: 'rgba(245,158,11,0.12)' },
  'Trade Intelligence': { slug: 'trade-intelligence', color: '#0D9488', bg: 'rgba(13,148,136,0.08)' },
  'Company News':       { slug: 'company-news',       color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  'Compliance Updates': { slug: 'compliance-updates', color: '#475569', bg: 'rgba(71,85,105,0.08)' },
}

export function categoryFromSlug(slug: string): ArticleCategory | null {
  const entry = Object.entries(ARTICLE_CATEGORIES).find(([, meta]) => meta.slug === slug)
  return (entry?.[0] as ArticleCategory) ?? null
}

export function readingTimeMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

// Anonymous read-only client; RLS exposes only published articles.
function getReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function fetchArticles(opts?: { category?: ArticleCategory; limit?: number }): Promise<Article[]> {
  const supabase = getReadClient()
  if (!supabase) return []
  let query = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(opts?.limit ?? 48)
  if (opts?.category) query = query.eq('category', opts.category)
  const { data, error } = await query
  if (error) {
    console.error('[news] fetchArticles:', error.message)
    return []
  }
  return (data as Article[]) ?? []
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = getReadClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  if (error) {
    console.error('[news] fetchArticleBySlug:', error.message)
    return null
  }
  return data as Article | null
}

export async function fetchActiveServiceAlerts(): Promise<Article[]> {
  const supabase = getReadClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('is_service_alert', true)
    .order('published_at', { ascending: false })
    .limit(3)
  if (error) return []
  return (data as Article[]) ?? []
}

export async function fetchRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const supabase = getReadClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .eq('category', article.category)
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(limit)
  return (data as Article[]) ?? []
}
