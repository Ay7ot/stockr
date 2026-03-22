'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getRecentSales } from '@/lib/sales'

export function useRecentSales(limit = 30) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['sales', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await getRecentSales(supabase, limit)
      if (error) throw error
      return data
    },
  })
}
