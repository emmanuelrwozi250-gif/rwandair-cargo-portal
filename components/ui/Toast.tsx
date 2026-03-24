'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

// ─── Single toast item ────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true))
    // Auto-dismiss after 4s
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const icons = {
    success: <CheckCircle className="w-4 h-4 shrink-0" />,
    error:   <AlertTriangle className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    info:    <Info className="w-4 h-4 shrink-0" />,
  }
  const colors: Record<ToastType, { bg: string; color: string; border: string }> = {
    success: { bg: 'var(--wb-green-light)', color: '#3d6b10',   border: '#94c94344' },
    error:   { bg: '#fff1f0',               color: '#b91c1c',   border: '#ef444444' },
    warning: { bg: '#fff9e6',               color: '#92400e',   border: '#f59e0b44' },
    info:    { bg: 'var(--wb-sky-light)',    color: 'var(--wb-blue)', border: 'rgba(30,162,220,0.3)' },
  }
  const c = colors[toast.type]

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 16px',
        borderRadius: '12px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        maxWidth: '340px',
        transition: 'all 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
      }}
    >
      {icons[toast.type]}
      <span style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
        {toast.message}
      </span>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, opacity: 0.6, padding: 0 }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container — fixed top-right */}
      <div
        aria-label="Notifications"
        style={{
          position: 'fixed', top: '80px', right: '16px',
          zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px',
          pointerEvents: toasts.length ? 'auto' : 'none',
        }}
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
