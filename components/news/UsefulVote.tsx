'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function UsefulVote({ slug }: { slug: string }) {
  const [voted, setVoted] = useState<null | boolean>(null)

  async function vote(useful: boolean) {
    if (voted !== null) return
    setVoted(useful) // optimistic — anonymous analytics vote, no need to block
    fetch(`/api/articles/${encodeURIComponent(slug)}/useful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ useful }),
    }).catch(() => {})
  }

  return (
    <div className="flex items-center gap-3 rounded-xl px-5 py-4"
         style={{ background: 'var(--wb-gray-50)', border: '1px solid var(--wb-gray-200)' }}>
      <p className="text-sm font-semibold flex-1" style={{ color: 'var(--wb-blue)' }} aria-live="polite">
        {voted === null ? 'Was this useful?' : 'Thanks for letting us know.'}
      </p>
      <button onClick={() => vote(true)} disabled={voted !== null}
              aria-label="Yes, this was useful" aria-pressed={voted === true}
              className="p-2.5 rounded-lg transition-colors disabled:opacity-60"
              style={{
                background: voted === true ? 'var(--wb-green-light)' : 'white',
                border: '1.5px solid var(--wb-gray-200)',
              }}>
        <ThumbsUp className="w-4 h-4" style={{ color: voted === true ? '#4a7c20' : 'var(--wb-gray-500)' }} aria-hidden="true" />
      </button>
      <button onClick={() => vote(false)} disabled={voted !== null}
              aria-label="No, this wasn't useful" aria-pressed={voted === false}
              className="p-2.5 rounded-lg transition-colors disabled:opacity-60"
              style={{
                background: voted === false ? 'rgba(220,38,38,0.08)' : 'white',
                border: '1.5px solid var(--wb-gray-200)',
              }}>
        <ThumbsDown className="w-4 h-4" style={{ color: voted === false ? '#dc2626' : 'var(--wb-gray-500)' }} aria-hidden="true" />
      </button>
    </div>
  )
}
