'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getReportForDay } from '@/lib/sales'

export function useReportForDay(day: Date) {
  const supabase = createClient()
  return useQuery({
    queryKey: ['report', day.toDateString()],
    queryFn: async () => {
      const { data, error } = await getReportForDay(supabase, day)
      if (error) throw error
      return data
    },
  })
}
