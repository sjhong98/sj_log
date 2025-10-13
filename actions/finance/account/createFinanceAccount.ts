'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'

export default async function createFinanceAccount(props: FinanceAccountType) {
  const user = await getUser()

  const { data, error } = await db
    .from('finance_account')
    .insert({
      ...props,
      uid: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating finance account:', error)
    throw error
  }

  return data
}
