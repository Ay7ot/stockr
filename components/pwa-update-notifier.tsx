'use client'

import { useEffect, useState } from 'react'

/**
 * PWA Update Notifier
 * 
 * Detects when a new service worker is waiting and prompts the user to update.
 * Uses skipWaiting for automatic updates with user notification.
 */
export function PWAUpdateNotifier() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return
    }

    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) return

        setRegistration(reg)

        // Check for updates periodically (every 60 seconds)
        const interval = setInterval(() => {
          reg.update()
        }, 60000)

        // Listen for service worker updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and ready
              setShowUpdatePrompt(true)
            }
          })
        })

        // Check if there's already a waiting service worker
        if (reg.waiting) {
          setShowUpdatePrompt(true)
        }

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Reload the page to use new assets
          window.location.reload()
        })

        return () => clearInterval(interval)
      } catch (error) {
        console.error('Service worker registration check failed:', error)
      }
    }

    checkForUpdates()
  }, [])

  const handleUpdate = () => {
    if (!registration?.waiting) return

    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // The controllerchange event will trigger reload
    setShowUpdatePrompt(false)
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="pwa-update-banner">
      <div className="pwa-update-content">
        <div className="pwa-update-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M21 21v-5h-5" />
          </svg>
        </div>
        <div className="pwa-update-text">
          <div className="pwa-update-title">New version available</div>
          <div className="pwa-update-desc">Update now to get the latest features</div>
        </div>
        <div className="pwa-update-actions">
          <button onClick={handleDismiss} className="btn-ghost pwa-update-btn-dismiss">
            Later
          </button>
          <button onClick={handleUpdate} className="btn-primary pwa-update-btn-update">
            Update Now
          </button>
        </div>
      </div>
    </div>
  )
}
