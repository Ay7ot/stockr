'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getInventoryUnitsForProduct } from '@/lib/inventory-units'

export function useInventoryUnits(
  productId: string | null,
  options?: { status?: 'in_stock' | 'sold' }
) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['inventory_units', productId, options?.status],
    queryFn: async () => {
      if (!productId) return []
      const { data, error } = await getInventoryUnitsForProduct(
        supabase,
        productId,
        options
      )
      if (error) throw error
      return data
    },
    enabled: Boolean(productId),
  })
}
