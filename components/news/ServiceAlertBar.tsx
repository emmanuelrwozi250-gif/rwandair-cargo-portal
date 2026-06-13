'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X } from 'lucide-react'
import type { Article } from '@/types'

// Amber pinned bar for active service alerts. Dismissal is per browser
// session (sessionStorage), keyed by the alert set so new alerts reappear.
export default function ServiceAlertBar({ alerts }: { alerts: Pick<Article, 'slug' | 'title' | 'summary'>[] }) {
  const [dismissed, setDismissed] = useState(true)
  const storageKey = `wb-alerts-${alerts.map(a => a.slug).join(',')}`

  useEffect(() => {
    if (!alerts.length) return
    setDismissed(sessionStorage.getItem(storageKey) === '1')
  }, [storageKey, alerts.length])

  if (!alerts.length || dismissed) return null

  return (
    <div role="alert"
         style={{ background: 'rgba(245,158,11,0.12)', borderBottom: '1px solid rgba(245,158,11,0.4)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#B45309' }} aria-hidden="true" />
        <div className="flex-1 min-w-0 text-sm" style={{ color: '#92400E' }}>
          {alerts.map(a => (
            <p key={a.slug} className="truncate sm:whitespace-normal">
              <strong>Service Alert:</strong> {a.summary}{' '}
              <Link href={`/news/${a.slug}`} className="font-bold underline underline-offset-2 whitespace-nowrap">
                Details →
              </Link>
            </p>
          ))}
        </div>
        <button onClick={() => { sessionStorage.setItem(storageKey, '1'); setDismissed(true) }}
                aria-label="Dismiss service alerts for this session"
                className="p-1 rounded hover:bg-black/5 shrink-0">
          <X className="w-4 h-4" style={{ color: '#92400E' }} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
