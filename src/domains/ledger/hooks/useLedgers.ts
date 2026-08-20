import { useCallback, useEffect, useState } from 'react'
import { fetchLedgers } from '../api/ledgerApi'
import type { Ledger } from '../types/ledger.types'

export function useLedgers() {
  const [ledgers, setLedgers] = useState<Ledger[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    const data = await fetchLedgers()
    setLedgers(data)
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

  return { ledgers, isLoading, refetch }
}
