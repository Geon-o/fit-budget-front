import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createLedger,
  deleteLedger as deleteLedgerApi,
  updateLedger,
  updateLedgerColor,
  useLedgers,
} from '../../domains/ledger'
import type { Ledger } from '../../domains/ledger'

const STORAGE_KEY = 'ledgerId'

interface LedgerContextValue {
  ledgerId: string | null
  ledgers: Ledger[]
  isLoading: boolean
  setLedgerId: (id: string) => void
  addLedger: (name: string) => Promise<void>
  renameLedger: (id: string, name: string) => Promise<void>
  setLedgerColor: (id: string, color: string) => Promise<void>
  deleteLedger: (id: string) => Promise<void>
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

export function LedgerProvider({ children }: { children: ReactNode }) {
  const { ledgers, isLoading, refetch } = useLedgers()
  const [ledgerId, setLedgerIdState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  )

  useEffect(() => {
    if (isLoading) return
    if (ledgers.length === 0) {
      if (ledgerId) {
        localStorage.removeItem(STORAGE_KEY)
        setLedgerIdState(null)
      }
      return
    }
    if (!ledgerId || !ledgers.some((l) => l.id === ledgerId)) {
      setLedgerIdState(ledgers[0].id)
      localStorage.setItem(STORAGE_KEY, ledgers[0].id)
    }
  }, [isLoading, ledgers, ledgerId])

  const setLedgerId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setLedgerIdState(id)
  }

  const addLedger = async (name: string) => {
    const created = await createLedger(name)
    await refetch()
    setLedgerId(created.id)
  }

  const renameLedger = async (id: string, name: string) => {
    await updateLedger(id, name)
    await refetch()
  }

  const setLedgerColor = async (id: string, color: string) => {
    await updateLedgerColor(id, color)
    await refetch()
  }

  const deleteLedger = async (id: string) => {
    await deleteLedgerApi(id)
    await refetch()
  }

  return (
    <LedgerContext.Provider
      value={{
        ledgerId,
        ledgers,
        isLoading,
        setLedgerId,
        addLedger,
        renameLedger,
        setLedgerColor,
        deleteLedger,
      }}
    >
      {children}
    </LedgerContext.Provider>
  )
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}
