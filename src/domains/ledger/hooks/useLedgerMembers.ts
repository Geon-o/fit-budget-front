import { useCallback, useEffect, useState } from 'react'
import { fetchLedgerMembers } from '../api/ledgerApi'
import type { LedgerMember } from '../types/ledger.types'

export function useLedgerMembers(ledgerId: string | null) {
  const [members, setMembers] = useState<LedgerMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refetch = useCallback(async () => {
    if (!ledgerId) {
      setMembers([])
      return []
    }
    const data = await fetchLedgerMembers(ledgerId)
    setMembers(data)
    return data
  }, [ledgerId])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    refetch().finally(() => {
      if (!cancelled) setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refetch])

  return { members, isLoading, refetch }
}
