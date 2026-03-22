import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Product } from '@/types/database'

const DEFAULT_PAGE_SIZE = 20

export async function getProducts(
  supabase: SupabaseClient<Database>,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: Product[]; count: number; error: Error | null }> {
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    return { data: [], count: 0, error: new Error(error.message) }
  }
  return { data: data ?? [], count: count ?? 0, error: null }
}

export async function getProductById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<{ data: Product | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error: new Error(error.message) }
  }
  return { data, error: null }
}

/** All products for sale dropdowns (no pagination). */
export async function getProductsForSaleSelect(
  supabase: SupabaseClient<Database>
): Promise<{ data: Product[]; error: Error | null }> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }
  return { data: data ?? [], error: null }
}
