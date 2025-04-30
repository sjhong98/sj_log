'use server'

import db from '@/supabase'
import { financeAccount, financeLog } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import FinanceLogType from '@/types/finance/FinanceLogType'
import { and, eq } from 'drizzle-orm'

export default async function createFinanceLog(props: FinanceLogType) {
  const user = await getUser()

  if (!user || !props.financeAccountPk) {
    console.error('User or financeAccountPk is not defined.')
    return
  }

  let [{ prevAmount }] = await db
    .select({ prevAmount: financeAccount.amount })
    .from(financeAccount)
    .where(
      and(
        eq(financeAccount.pk, props.financeAccountPk),
        eq(financeAccount.uid, user.id)
      )
    )

  if (prevAmount === undefined) {
    console.error('Previous amount is not defined.')
    return
  }

  await db
    .update(financeAccount)
    .set({
      amount:
        prevAmount +
        (props.type === 'income'
          ? (props.amount ?? 0)
          : (props.amount ?? 0) * -1)
    })
    .where(
      and(
        eq(financeAccount.pk, props.financeAccountPk),
        eq(financeAccount.uid, user.id)
      )
    )

  const result = await db.insert(financeLog).values({
    ...props,
    uid: user.id,
    date: props.date
      ? new Date(props.date).toISOString()
      : new Date().toISOString()
  })

  return result.rowCount
}
