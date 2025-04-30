import FinanceDashboard from '@/components/finance/FinanceDashboard'
import dayjs from 'dayjs'
import getAccounts from '@/actions/finance/account/getAccounts'
import getMonthlyLogs from '@/actions/finance/log/getMonthlyLogs'

export default async function Page() {
  const accounts = await getAccounts()
  if (!accounts) return

  return (
    <FinanceDashboard
      initialData={{
        accounts
      }}
    />
  )
}
