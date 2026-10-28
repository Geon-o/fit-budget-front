export interface Ledger {
  id: string
  name: string
  color: string | null
}

export interface LedgerMember {
  id: string
  userId: string
  name: string | null
}
