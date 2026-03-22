'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function SettingsClient() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const layoutUser = {
    email: user.email,
    profile: user.profile
      ? { name: user.profile.name, role: user.profile.role }
      : undefined,
  }

  return (
    <DashboardLayout user={layoutUser} title="Settings">
      <div className="page-header">
        <div>
          <div className="page-heading">Settings</div>
          <div className="page-sub">Configure your inventory system</div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--text-tertiary)',
            margin: '0 auto 16px',
          }}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m7.07-14.07l-4.24 4.24m-5.66 5.66L4.93 19.07M23 12h-6m-6 0H1m18.07 7.07l-4.24-4.24m-5.66-5.66L4.93 4.93" />
        </svg>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Settings Coming Soon
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            maxWidth: '400px',
            margin: '0 auto',
          }}
        >
          Configure stock thresholds, notifications, and system preferences.
        </p>
      </div>
    </DashboardLayout>
  )
}
