import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, InventoryUnit } from '@/types/database'

export async function getInventoryUnitsForProduct(
  supabase: SupabaseClient<Database>,
  productId: string,
  options?: { status?: 'in_stock' | 'sold' }
): Promise<{ data: InventoryUnit[]; error: Error | null }> {
  let q = supabase
    .from('inventory_units')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (options?.status) {
    q = q.eq('status', options.status)
  }

  const { data, error } = await q
  if (error) {
    return { data: [], error: new Error(error.message) }
  }
  return { data: data ?? [], error: null }
}
