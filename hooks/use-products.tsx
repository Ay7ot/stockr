'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getProducts } from '@/lib/products'
import type { Product } from '@/types/database'

interface UseProductsResult {
  products: Product[]
  count: number
  isLoading: boolean
  isError: boolean
  error: Error | null
}

export function useProducts(page: number = 1, pageSize: number = 20) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['products', page, pageSize],
    queryFn: async (): Promise<{ products: Product[]; count: number }> => {
      const { data, count, error } = await getProducts(supabase, { page, pageSize })
      if (error) throw error
      return { products: data, count }
    },
  })
}
