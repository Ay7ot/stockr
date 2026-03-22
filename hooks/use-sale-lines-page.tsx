'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { getSaleLinesPage, type SaleLinesPageParams } from '@/lib/sales'

export function useSaleLinesPage(
  params: SaleLinesPageParams & { enabled?: boolean }
) {
  const supabase = createClient()
  const { page, pageSize, range, enabled = true } = params

  return useQuery({
    enabled,
    queryKey: [
      'sale_lines_page',
      page,
      pageSize,
      range ? `${range.from.toISOString()}_${range.to.toISOString()}` : 'all',
    ],
    queryFn: async () => {
      const { data, error } = await getSaleLinesPage(supabase, { page, pageSize, range })
      if (error) throw error
      return data
    },
  })
}
