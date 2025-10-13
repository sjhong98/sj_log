'use server'

import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import createFinanceLog from '@/actions/finance/log/createFinanceLog'

export default async function calibrateAccounts({
  accounts,
  prevAccounts
}: {
  accounts: FinanceAccountType[]
  prevAccounts: FinanceAccountType[]
}) {
  const user = await getUser()
  if (!user) return

  const result = await Promise.all(
    accounts.map(async (account, i) => {
      if (!account.pk) return
      if (account.amount !== prevAccounts[i].amount) {
        const gap = account.amount - prevAccounts[i].amount
        const type = gap > 0 ? 'income' : 'expense'
        const calibratedAmount = gap > 0 ? gap : gap * -1
        await createFinanceLog({
          type,
          amount: calibratedAmount,
          category: 'calibration',
          note: `${account.title}`,
          paymentMethod: '',
          financeAccountPk: account.pk,
          date: new Date()
        })
      }

      const { error } = await db
        .from('finance_account')
        .update({
          amount: account.amount
        })
        .eq('uid', user.id)
        .eq('pk', account.pk)

      if (error) {
        console.error('Error updating finance account:', error)
        throw error
      }

      return { rowCount: 1 }
    })
  )

  return result?.[0]?.rowCount
}
