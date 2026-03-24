'use client'

import { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#f59e0b' }} />
            <h2 style={{ color: 'var(--wb-blue)', marginBottom: '0.5rem' }}>Something went wrong</h2>
            <p style={{ color: 'var(--wb-gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.message && (
              <p style={{
                fontFamily: 'monospace', fontSize: '0.75rem', padding: '0.75rem 1rem',
                borderRadius: '8px', background: '#fff1f0', color: '#b91c1c',
                marginBottom: '1.5rem', textAlign: 'left',
              }}>
                {this.state.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                  background: 'var(--wb-blue)', color: 'white',
                  fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                }}
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <a
                href="/"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                  background: 'var(--wb-gray-50)', color: 'var(--wb-gray-500)',
                  fontWeight: 600, fontSize: '0.875rem',
                  border: '1px solid var(--wb-gray-200)', textDecoration: 'none',
                }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
