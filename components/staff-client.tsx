'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { StaffFormDialog } from '@/components/staff-form'
import { StaffAccessDialog } from '@/components/staff-access-dialog'
import { StaffRoleDialog } from '@/components/staff-role-dialog'
import { useUser } from '@/hooks/use-user'
import { useStaff } from '@/hooks/use-staff'
import { formatNairaWithPrefix } from '@/lib/format-numbers'
import type { StaffWithActivity } from '@/app/actions/staff'

export function StaffClient() {
  const { data: user, isLoading: userLoading } = useUser()
  const router = useRouter()
  const { data: staff, isLoading, isError, error } = useStaff()

  const [formOpen, setFormOpen] = useState(false)
  const [accessDialogState, setAccessDialogState] = useState<{
    staff: StaffWithActivity
    shouldDisable: boolean
  } | null>(null)
  const [roleDialogStaff, setRoleDialogStaff] = useState<StaffWithActivity | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!userLoading && user && user.profile?.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [user, userLoading, router])

  const closeForm = useCallback(() => {
    setFormOpen(false)
  }, [])

  const openAdd = useCallback(() => {
    setFormOpen(true)
  }, [])

  const handleToggleAccess = useCallback((member: StaffWithActivity) => {
    setAccessDialogState({
      staff: member,
      shouldDisable: !member.is_banned,
    })
  }, [])

  const handleChangeRole = useCallback((member: StaffWithActivity) => {
    setRoleDialogStaff(member)
  }, [])

  if (userLoading || !user) {
    return null
  }

  if (user.profile?.role !== 'admin') {
    return null
  }

  const layoutUser = {
    email: user.email,
    profile: user.profile
      ? { name: user.profile.name, role: user.profile.role }
      : undefined,
  }

  return (
    <>
      <DashboardLayout
        user={layoutUser}
        title="Staff"
        showAddButton={true}
        onAddClick={openAdd}
        addButtonLabel="Add Staff"
        alertCount={0}
        topbarShowSearch={false}
      >
        <div className="page-header">
          <div>
            <div className="page-heading">Staff</div>
            <div className="page-sub">
              {isLoading
                ? 'Loading staff...'
                : staff
                  ? `${staff.length} ${staff.length === 1 ? 'member' : 'members'}`
                  : 'No staff members yet'}
            </div>
          </div>
        </div>

        <div className="page-body">
          {isError && (
            <div className="error-box">
              <div className="error-title">Failed to load staff</div>
              <div className="error-message">{(error as Error)?.message || 'An error occurred'}</div>
            </div>
          )}

          {isLoading && !staff && (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p className="loading-text">Loading staff...</p>
            </div>
          )}

          {!isLoading && staff && staff.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">No staff members yet</div>
              <div className="empty-message">
                Create staff accounts to give your team access to the system.
              </div>
            </div>
          )}

          {staff && staff.length > 0 && (
            <div className="staff-grid">
              {staff.map((member) => (
                <div key={member.id} className={`staff-card ${member.is_banned ? 'staff-card-disabled' : ''}`}>
                  <div className="staff-card-header">
                    <div className="staff-avatar">
                      {member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="staff-info">
                      <div className="staff-name">{member.name}</div>
                      <div className="staff-role-badge">
                        <span className={`badge badge-${member.role === 'admin' ? 'blue' : 'neutral'}`}>
                          {member.role}
                        </span>
                        {member.is_banned && (
                          <span className="badge badge-red">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="staff-stats">
                    <div className="staff-stat">
                      <div className="staff-stat-label">Sales recorded</div>
                      <div className="staff-stat-value">{member.sales_count}</div>
                    </div>
                    <div className="staff-stat">
                      <div className="staff-stat-label">Total revenue</div>
                      <div className="staff-stat-value">{formatNairaWithPrefix(member.total_revenue)}</div>
                    </div>
                  </div>

                  <div className="staff-actions">
                    <button
                      type="button"
                      onClick={() => handleChangeRole(member)}
                      className="btn btn-sm btn-secondary"
                    >
                      Change Role
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAccess(member)}
                      className={`btn btn-sm ${member.is_banned ? 'btn-secondary' : 'btn-destructive'}`}
                    >
                      {member.is_banned ? 'Enable' : 'Disable'}
                    </button>
                  </div>

                  <div className="staff-meta">
                    <div className="staff-meta-label">Joined</div>
                    <div className="staff-meta-value">
                      {new Date(member.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>

      {formOpen && <StaffFormDialog onClose={closeForm} />}
      
      {accessDialogState && (
        <StaffAccessDialog
          staff={accessDialogState.staff}
          shouldDisable={accessDialogState.shouldDisable}
          onClose={() => setAccessDialogState(null)}
        />
      )}

      {roleDialogStaff && (
        <StaffRoleDialog
          staff={roleDialogStaff}
          onClose={() => setRoleDialogStaff(null)}
        />
      )}
    </>
  )
}
