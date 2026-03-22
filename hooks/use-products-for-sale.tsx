'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getProductsForSaleSelect } from '@/lib/products'

export function useProductsForSale() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['products', 'all_for_sale'],
    queryFn: async () => {
      const { data, error } = await getProductsForSaleSelect(supabase)
      if (error) throw error
      return data
    },
  })
}
