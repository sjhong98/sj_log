'use client'

import { getUser as fetchUser } from '@/actions/session/getUser'
import React, { createContext, useCallback, useEffect, useState } from 'react'

export type UserContextValue = {
  user: any
  getUser: (accessToken?: any) => Promise<any>
  isLoading: boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUser = useCallback(async (accessToken?: any) => {
    const result = await fetchUser(accessToken)
    setUser(result ?? null)
    return result
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const result = await fetchUser()
      if (mounted) {
        setUser(result ?? null)
        setIsLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const value: UserContextValue = {
    user,
    getUser,
    isLoading
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
