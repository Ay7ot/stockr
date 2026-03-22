'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getTodayStats } from '@/lib/sales'

export function useTodaySalesStats(day: Date = new Date()) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['sales_stats', day.toDateString()],
    queryFn: async () => {
      const { data, error } = await getTodayStats(supabase, day)
      if (error) throw error
      return data
    },
  })
}
