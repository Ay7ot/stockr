'use client'

import { useQuery } from '@tanstack/react-query'
import { getStaffList, type StaffWithActivity } from '@/app/actions/staff'

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaffList(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
