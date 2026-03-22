'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroidDevice = /Android/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true

    setIsIOS(isIOSDevice)
    setIsAndroid(isAndroidDevice)
    setIsStandalone(isInStandaloneMode)

    if (isInStandaloneMode) {
      return
    }

    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed')
    if (hasSeenPrompt) {
      return
    }

    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 3000)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === 'accepted') {
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-dismissed', 'true')
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-backdrop" onClick={handleDismiss} />
      <div className="pwa-install-modal">
        <div className="pwa-install-header">
          <div className="pwa-install-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <button onClick={handleDismiss} className="pwa-install-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="pwa-install-content">
          <h2 className="pwa-install-title">Install Stockr</h2>
          <p className="pwa-install-desc">
            Get quick access to your inventory from your home screen
          </p>

          {isIOS && (
            <div className="pwa-install-steps">
              <div className="pwa-install-step">
                <div className="pwa-install-step-num">1</div>
                <div className="pwa-install-step-text">
                  Tap the <strong>Share</strong> button 
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: 'middle' }}>
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg> at the bottom
                </div>
              </div>
              <div className="pwa-install-step">
                <div className="pwa-install-step-num">2</div>
                <div className="pwa-install-step-text">
                  Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>
                </div>
              </div>
              <div className="pwa-install-step">
                <div className="pwa-install-step-num">3</div>
                <div className="pwa-install-step-text">
                  Tap <strong>&quot;Add&quot;</strong> to confirm
                </div>
              </div>
            </div>
          )}

          {isAndroid && deferredPrompt && (
            <button onClick={handleInstall} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              Install App
            </button>
          )}

          {isAndroid && !deferredPrompt && (
            <div className="pwa-install-steps">
              <div className="pwa-install-step">
                <div className="pwa-install-step-num">1</div>
                <div className="pwa-install-step-text">
                  Tap the <strong>menu</strong> button (⋮) in your browser
                </div>
              </div>
              <div className="pwa-install-step">
                <div className="pwa-install-step-num">2</div>
                <div className="pwa-install-step-text">
                  Select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>
                </div>
              </div>
            </div>
          )}

          {!isIOS && !isAndroid && (
            <button onClick={handleDismiss} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
              Maybe Later
            </button>
          )}
        </div>

        {isIOS && (
          <div className="pwa-install-footer">
            <button onClick={handleDismiss} className="btn-ghost">
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
