'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useUser } from '@/hooks/use-user'
import type { UserWithProfile } from '@/hooks/use-user'

type AuthContextType = {
  user: UserWithProfile | null | undefined
  isLoading: boolean
  refreshUser: () => Promise<unknown>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, refetch } = useUser()

  const refreshUser = () => refetch()

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
