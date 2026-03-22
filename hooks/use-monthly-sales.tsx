'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getMonthlySales } from '@/lib/sales'

export function useMonthlySales(monthsBack = 8) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['sales', 'monthly', monthsBack],
    queryFn: async () => {
      const { data, error } = await getMonthlySales(supabase, monthsBack)
      if (error) throw error
      return data
    },
  })
}
