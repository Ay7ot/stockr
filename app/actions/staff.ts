'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

export type StaffFormState =
  | {
      error?: string
      success?: boolean
      staff?: Profile
    }
  | undefined

export type StaffWithActivity = Profile & {
  sales_count: number
  total_revenue: number
  is_banned: boolean
}

async function checkAdmin(): Promise<
  | { ok: false; error: string; supabase?: never }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to manage staff.' }
  }

  const role = user.user_metadata?.role || user.app_metadata?.role
  const isAdmin = role === 'admin'

  if (!isAdmin && !role) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { ok: false, error: 'You do not have permission to manage staff.' }
    }
  } else if (!isAdmin) {
    return { ok: false, error: 'You do not have permission to manage staff.' }
  }

  return { ok: true, supabase }
}

export async function createStaff(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }
  const supabase = gate.supabase

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const role = String(formData.get('role') ?? 'staff').trim() as 'admin' | 'staff'
  const password = String(formData.get('password') ?? '').trim()

  if (!name) return { error: 'Name is required.' }
  if (!email) return { error: 'Email is required.' }
  if (!password) return { error: 'Password is required.' }
  if (password.length < 6) return { error: 'Password must be at least 6 characters.' }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Enter a valid email address.' }
  }

  if (role !== 'admin' && role !== 'staff') {
    return { error: 'Invalid role.' }
  }

  let adminClient
  try {
    adminClient = createAdminClient()
  } catch (err) {
    return { 
      error: err instanceof Error 
        ? err.message 
        : 'Failed to initialize admin client. Check SUPABASE_SERVICE_ROLE_KEY in .env.local' 
    }
  }

  try {
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { error: 'This email is already registered.' }
      }
      return { error: authError.message }
    }

    if (!authUser.user) {
      return { error: 'Failed to create user account.' }
    }

    await new Promise(resolve => setTimeout(resolve, 100))

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select()
      .eq('id', authUser.user.id)
      .single()

    if (profileError) {
      console.error('[createStaff] Profile not found after user creation:', profileError.message)
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      return { error: 'Failed to create staff profile. The auto-create trigger may not be working.' }
    }

    revalidatePath('/staff')

    return { success: true, staff: profile as Profile }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create staff account.' }
  }
}

export async function getStaffList(): Promise<StaffWithActivity[]> {
  const gate = await checkAdmin()
  if (!gate.ok) return []
  const supabase = gate.supabase
  const adminClient = createAdminClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError || !profiles) {
    console.error('[getStaffList] profiles error:', profilesError?.message)
    return []
  }

  const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers()
  
  if (authError) {
    console.error('[getStaffList] auth users error:', authError.message)
  }

  const bannedUserIds = new Set(
    authUsers?.users
      .filter(u => u.banned_until && new Date(u.banned_until) > new Date())
      .map(u => u.id) || []
  )

  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select('id, sold_by')

  if (salesError) {
    console.error('[getStaffList] sales error:', salesError.message)
    return profiles.map(p => ({
      ...p,
      sales_count: 0,
      total_revenue: 0,
    }))
  }

  const { data: saleItems, error: saleItemsError } = await supabase
    .from('sale_items')
    .select('sale_id, unit_price, quantity_sold')

  if (saleItemsError) {
    console.error('[getStaffList] sale_items error:', saleItemsError.message)
  }

  const salesByStaff = new Map<string, { count: number; revenue: number }>()
  
  if (salesData && saleItems) {
    const saleIdToStaff = new Map(salesData.map(s => [s.id, s.sold_by]))
    
    for (const sale of salesData) {
      const current = salesByStaff.get(sale.sold_by) || { count: 0, revenue: 0 }
      current.count++
      salesByStaff.set(sale.sold_by, current)
    }
    
    for (const item of saleItems) {
      const staff = saleIdToStaff.get(item.sale_id)
      if (staff) {
        const current = salesByStaff.get(staff)
        if (current) {
          current.revenue += item.unit_price * item.quantity_sold
        }
      }
    }
  }

  return profiles.map(profile => {
    const activity = salesByStaff.get(profile.name) || { count: 0, revenue: 0 }
    return {
      ...profile,
      sales_count: activity.count,
      total_revenue: activity.revenue,
      is_banned: bannedUserIds.has(profile.id),
    }
  })
}

export async function updateStaffRole(
  staffId: string,
  newRole: 'admin' | 'staff'
): Promise<StaffFormState> {
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }
  const supabase = gate.supabase

  if (newRole !== 'admin' && newRole !== 'staff') {
    return { error: 'Invalid role.' }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', staffId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  const adminClient = createAdminClient()
  const { error: metadataError } = await adminClient.auth.admin.updateUserById(staffId, {
    user_metadata: { role: newRole },
  })

  if (metadataError) {
    console.error('[updateStaffRole] metadata update failed:', metadataError.message)
  }

  revalidatePath('/staff')

  return { success: true, staff: data as Profile }
}

export async function toggleStaffAccess(
  staffId: string,
  shouldDisable: boolean
): Promise<StaffFormState> {
  const gate = await checkAdmin()
  if (!gate.ok) return { error: gate.error }

  const adminClient = createAdminClient()

  try {
    if (shouldDisable) {
      const banUntil = new Date()
      banUntil.setFullYear(banUntil.getFullYear() + 100)
      
      const { error } = await adminClient.auth.admin.updateUserById(staffId, {
        ban_duration: '876000h',
      })

      if (error) {
        return { error: error.message }
      }
    } else {
      const { error } = await adminClient.auth.admin.updateUserById(staffId, {
        ban_duration: 'none',
      })

      if (error) {
        return { error: error.message }
      }
    }

    revalidatePath('/staff')

    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update staff access' }
  }
}
