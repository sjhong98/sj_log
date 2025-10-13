'use server'

import FinanceAccountType from '@/types/finance/account/FinanceAccountType'
import db from '@/supabase'
import { financeAccount } from '@/supabase/schema'
import { and, eq } from 'drizzle-orm'
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

      return db
        .update(financeAccount)
        .set({
          amount: account.amount
        })
        .where(
          and(
            eq(financeAccount.uid, user.id),
            eq(financeAccount.pk, account.pk)
          )
        )
    })
  )

  return result?.[0]?.rowCount
}
