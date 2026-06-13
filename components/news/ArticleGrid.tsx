'use client'

import { useState } from 'react'
import ArticleCard from './ArticleCard'
import { ARTICLE_CATEGORIES } from '@/lib/news'
import type { Article, ArticleCategory } from '@/types'

const PAGE = 12

// Client-side category tabs + "load more" — filtering never reloads the page.
export default function ArticleGrid({ articles }: { articles: Article[] }) {
  const [category, setCategory] = useState<ArticleCategory | 'All'>('All')
  const [shown, setShown] = useState(PAGE)

  const filtered = category === 'All' ? articles : articles.filter(a => a.category === category)
  const visible = filtered.slice(0, shown)

  return (
    <div>
      <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2 mb-8">
        {(['All', ...Object.keys(ARTICLE_CATEGORIES)] as const).map(cat => {
          const active = category === cat
          const meta = cat !== 'All' ? ARTICLE_CATEGORIES[cat as ArticleCategory] : null
          return (
            <button key={cat} role="tab" aria-selected={active}
                    onClick={() => { setCategory(cat as ArticleCategory | 'All'); setShown(PAGE) }}
                    className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
                    style={active
                      ? { background: meta?.color ?? 'var(--wb-blue)', color: 'white' }
                      : { background: 'white', color: meta?.color ?? 'var(--wb-blue)', border: '1.5px solid var(--wb-gray-200)' }}>
              {cat}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-center py-16" style={{ color: 'var(--wb-gray-500)' }}>
          No articles in this category yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visible.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}

      {filtered.length > shown && (
        <div className="text-center mt-10">
          <button onClick={() => setShown(s => s + PAGE)}
                  className="px-8 py-3 rounded-full font-bold text-sm"
                  style={{ border: '1.5px solid var(--wb-gray-200)', background: 'white', color: 'var(--wb-blue)' }}>
            Load more ({filtered.length - shown} remaining)
          </button>
        </div>
      )}
    </div>
  )
}
