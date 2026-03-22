'use client'

import { DashboardLayout } from '@/components/dashboard-layout'
import { LogoutButton } from '@/components/logout-button'
import { useUser } from '@/hooks/use-user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProfileClient() {
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
    <DashboardLayout user={layoutUser} title="Profile">
      <div className="page-header">
        <div>
          <div className="page-heading">Profile</div>
          <div className="page-sub">Manage your account settings</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '20px',
          }}
        >
          <div
            className="avatar avatar-lg"
            style={{
              background: 'linear-gradient(135deg, #0071e3, #bf5af2)',
            }}
          >
            {(user.profile?.name || user.email)
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h3
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              {user.profile?.name || user.email.split('@')[0]}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {user.email}
            </p>
            <span
              className={`badge ${user.profile?.role === 'admin' ? 'b-blue' : 'badge-neutral'
                }`}
              style={{ marginTop: '6px' }}
            >
              {user.profile?.role === 'admin' ? 'Administrator' : 'Staff'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--ink-700)',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="input"
              style={{ width: '100%', opacity: 0.6 }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--ink-700)',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              defaultValue={user.profile?.name || ''}
              placeholder="Add your name"
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <button className="btn btn-primary">Save Changes</button>
            <LogoutButton />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
