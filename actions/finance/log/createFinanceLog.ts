'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import FinanceLogType from '@/types/finance/FinanceLogType'

export default async function createFinanceLog(props: FinanceLogType) {
  const user = await getUser()

  if (!user || !props.financeAccountPk) {
    console.error('User or financeAccountPk is not defined.')
    return
  }

  const { data: account, error: accountError } = await db
    .from('finance_account')
    .select('amount')
    .eq('pk', props.financeAccountPk)
    .eq('uid', user.id)
    .single()

  if (accountError || account?.amount === undefined) {
    console.error('Previous amount is not defined.')
    return
  }

  const prevAmount = account.amount

  const { error: updateError } = await db
    .from('finance_account')
    .update({
      amount:
        prevAmount +
        (props.type === 'income'
          ? (props.amount ?? 0)
          : (props.amount ?? 0) * -1)
    })
    .eq('pk', props.financeAccountPk)
    .eq('uid', user.id)

  if (updateError) {
    console.error('Error updating finance account:', updateError)
    throw updateError
  }

  const { data: result, error: insertError } = await db
    .from('finance_log')
    .insert({
      ...props,
      uid: user.id,
      date: props.date
        ? new Date(props.date).toISOString()
        : new Date().toISOString()
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error creating finance log:', insertError)
    throw insertError
  }

  return result
}
