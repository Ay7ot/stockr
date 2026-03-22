'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

export type SaleLineInput = {
  product_id: string
  unit_price: number
  quantity_sold: number
  inventory_unit_id?: string | null
}

export async function recordSale(
  lines: SaleLineInput[],
  customer: { name: string; phone: string }
): Promise<{ ok: true; saleId: string } | { ok: false; error: string }> {
  if (!lines.length) {
    return { ok: false, error: 'Add at least one line item.' }
  }

  const customerName = customer.name?.trim() ?? ''
  const customerPhone = customer.phone?.trim() ?? ''
  if (!customerName) {
    return { ok: false, error: 'Customer name is required.' }
  }
  if (!customerPhone) {
    return { ok: false, error: 'Customer phone number is required.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { ok: false, error: 'You must be logged in to record a sale.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  const soldBy = profile?.name?.trim() || user.email || 'Staff'

  const payload: Record<string, unknown>[] = []
  for (const line of lines) {
    if (!line.product_id) {
      return { ok: false, error: 'Each line needs a product.' }
    }
    if (!Number.isFinite(line.unit_price) || line.unit_price < 0) {
      return { ok: false, error: 'Enter a valid price for each line.' }
    }
    if (!Number.isFinite(line.quantity_sold) || line.quantity_sold < 1) {
      return { ok: false, error: 'Enter a valid quantity for each line.' }
    }
    payload.push({
      product_id: line.product_id,
      unit_price: line.unit_price,
      quantity_sold: Math.floor(line.quantity_sold),
      inventory_unit_id: line.inventory_unit_id ?? null,
    })
  }

  const { data: saleId, error: rpcError } = await supabase.rpc('record_sale', {
    p_items: payload as unknown as Json,
    p_sold_by: soldBy,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
  })

  if (rpcError) {
    return { ok: false, error: rpcError.message }
  }
  if (!saleId) {
    return { ok: false, error: 'Sale was not recorded.' }
  }

  revalidatePath('/sales')
  revalidatePath('/dashboard')
  revalidatePath('/reports')
  revalidatePath('/products')

  return { ok: true, saleId }
}
