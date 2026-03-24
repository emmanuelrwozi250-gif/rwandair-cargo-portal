'use client'

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      onFocus={e => { e.currentTarget.style.left = '8px' }}
      onBlur={e => { e.currentTarget.style.left = '-9999px' }}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '8px',
        zIndex: 10000,
        padding: '8px 16px',
        background: 'var(--wb-blue)',
        color: 'white',
        fontWeight: 700,
        borderRadius: '0 0 8px 0',
        fontSize: '0.875rem',
        textDecoration: 'none',
      }}
    >
      Skip to main content
    </a>
  )
}
