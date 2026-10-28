import { useCallback, useEffect, useState } from 'react'
import { fetchMe } from '../api/authApi'
import type { User } from '../types/auth.types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    const data = await fetchMe()
    setUser(data)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false
    refetch().finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refetch])

  return { user, isLoading, refetch }
}
