export default interface FinanceLogType {
  pk?: number
  uid?: string
  type: string
  amount?: number | null
  category: string | null
  note: string | null
  paymentMethod: string | null
  date: Date | string | null
  createdAt?: any
  isNewDay?: boolean
  financeAccountPk?: null | number
}
