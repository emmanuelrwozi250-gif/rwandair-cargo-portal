'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X, MessageSquarePlus } from 'lucide-react'
import NpsPulse from './NpsPulse'

// Site-wide "Share feedback" affordance: a quiet footer link that opens a
// slide-in drawer with the quick NPS pulse. Never floats over content.
export default function FeedbackDrawer() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape closes; basic focus management for a11y
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLElement>('button, [href], input, textarea')?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs hover:text-white transition-colors"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
        <MessageSquarePlus className="w-3.5 h-3.5" aria-hidden="true" />
        Share feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Share feedback">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div ref={panelRef}
               className="absolute right-0 top-0 bottom-0 w-full max-w-md overflow-y-auto p-6 sm:p-8 shadow-2xl"
               style={{ background: 'white', animation: 'drawerIn 220ms ease-out' }}>
            <div className="flex items-center justify-between mb-6">
              <p className="font-bold" style={{ color: 'var(--wb-blue)' }}>We want to hear from you</p>
              <button onClick={() => setOpen(false)} aria-label="Close feedback drawer"
                      className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: 'var(--wb-gray-500)' }} aria-hidden="true" />
              </button>
            </div>

            <NpsPulse source="drawer" compact />

            <p className="text-xs mt-8 pt-4" style={{ color: 'var(--wb-gray-500)', borderTop: '1px solid var(--wb-gray-200)' }}>
              Something specific —  a route request, a booking issue, an idea?{' '}
              <Link href="/feedback" className="font-semibold underline" style={{ color: 'var(--wb-blue)' }}
                    onClick={() => setOpen(false)}>
                Visit the feedback centre
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
