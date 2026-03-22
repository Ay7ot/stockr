'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidImei, normalizeIdentifier } from '@/lib/identifiers'
import type { IdentifierKind } from '@/types/database'

async function checkAdmin(): Promise<
  | { ok: false; error: string }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'You must be logged in.' }
  }

  const role = user.user_metadata?.role || user.app_metadata?.role
  const isAdmin = role === 'admin'

  if (!isAdmin && !role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return { ok: false, error: 'You do not have permission.' }
    }
  } else if (!isAdmin) {
    return { ok: false, error: 'You do not have permission.' }
  }

  return { ok: true, supabase }
}

export async function addInventoryUnit(
  productId: string,
  rawIdentifier: string,
  kind: IdentifierKind
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await checkAdmin()
  if (!gate.ok) return { ok: false, error: gate.error }
  const supabase = gate.supabase

  const identifier = normalizeIdentifier(rawIdentifier, kind)
  if (!identifier) {
    return { ok: false, error: 'Enter an identifier.' }
  }
  if (kind === 'imei' && !isValidImei(identifier)) {
    return { ok: false, error: 'IMEI should be 14–16 digits.' }
  }

  const { error } = await supabase.from('inventory_units').insert({
    product_id: productId,
    identifier,
    identifier_kind: kind,
    status: 'in_stock',
  })

  if (error) {
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('inventory_units')
        .select('product_id, products(name)')
        .eq('identifier', identifier)
        .maybeSingle()

      const row = existing as {
        product_id: string
        products: { name: string } | null
      } | null

      if (row && row.product_id !== productId) {
        const pname = row.products?.name
        return {
          ok: false,
          error: pname
            ? `That identifier is already registered on “${pname}”.`
            : 'That identifier is already registered on another product.',
        }
      }

      return { ok: false, error: 'That identifier is already registered.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/products')
  return { ok: true }
}

export async function deleteInventoryUnit(
  unitId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gate = await checkAdmin()
  if (!gate.ok) return { ok: false, error: gate.error }
  const supabase = gate.supabase

  const { data: row, error: fetchErr } = await supabase
    .from('inventory_units')
    .select('status')
    .eq('id', unitId)
    .maybeSingle()

  if (fetchErr) return { ok: false, error: fetchErr.message }
  if (!row) return { ok: false, error: 'Unit not found.' }
  if (row.status !== 'in_stock') {
    return { ok: false, error: 'Only unsold units can be removed.' }
  }

  const { error } = await supabase.from('inventory_units').delete().eq('id', unitId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/products')
  return { ok: true }
}
