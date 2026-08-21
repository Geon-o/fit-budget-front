export interface Ledger {
  id: string
  name: string
  color: string | null
}

export interface LedgerMember {
  id: string
  userId: string
  email: string
  name: string | null
}
