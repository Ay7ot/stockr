'use client'

import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="pwa-container" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px'
    }}>
      <div style={{
        maxWidth: '400px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--r-lg)',
          background: 'var(--ink-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-400)'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        </div>

        <div>
          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            You&apos;re Offline
          </h1>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6
          }}>
            No internet connection detected. Please check your network and try again.
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="btn-primary"
          style={{ marginTop: '12px' }}
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
