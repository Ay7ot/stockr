'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profile } from '@/types/database'

export type UserWithProfile = {
  id: string
  email: string
  profile: Profile | null
}

async function fetchUser(): Promise<UserWithProfile | null> {
  const res = await fetch('/api/user', {
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Failed to load user')
  return res.json() as Promise<UserWithProfile>
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: false,
  })
}
