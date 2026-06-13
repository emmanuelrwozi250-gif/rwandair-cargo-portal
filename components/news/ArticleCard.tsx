import Link from 'next/link'
import Image from 'next/image'
import { ARTICLE_CATEGORIES, readingTimeMinutes } from '@/lib/news'
import type { Article } from '@/types'

export function CategoryPill({ category }: { category: Article['category'] }) {
  const meta = ARTICLE_CATEGORIES[category]
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: meta.bg, color: meta.color }}>
      {category}
    </span>
  )
}

export default function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const meta = ARTICLE_CATEGORIES[article.category]
  const date = new Date(article.published_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <article className={`rounded-2xl overflow-hidden flex flex-col card-lift ${featured ? 'md:flex-row' : ''}`}
             style={{ background: 'white', border: '1px solid var(--wb-gray-200)' }}>
      {article.hero_image_url && (
        <Link href={`/news/${article.slug}`}
              className={`relative block ${featured ? 'md:w-1/2 min-h-[240px]' : 'h-44'}`}>
          <Image
            src={article.hero_image_url}
            alt={article.hero_image_alt ?? ''}
            fill
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover"
          />
        </Link>
      )}
      <div className={`p-6 flex flex-col gap-3 flex-1 ${featured ? 'md:p-8 justify-center' : ''}`}>
        <div className="flex items-center justify-between gap-2">
          <CategoryPill category={article.category} />
          <time dateTime={article.published_at} className="text-xs" style={{ color: 'var(--wb-gray-500)' }}>
            {date}
          </time>
        </div>
        <h3 className={`font-bold leading-snug ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}
            style={{ color: 'var(--wb-blue)' }}>
          <Link href={`/news/${article.slug}`} className="hover:underline underline-offset-2">
            {article.title}
          </Link>
        </h3>
        <p className={`text-sm flex-1 ${featured ? 'md:text-base' : ''}`}
           style={{ color: 'var(--wb-gray-500)', lineHeight: 1.65 }}>
          {article.summary}
        </p>
        <p className="text-xs font-semibold" style={{ color: meta.color }}>
          {article.author_name} · {readingTimeMinutes(article.body)} min read
        </p>
      </div>
    </article>
  )
}
