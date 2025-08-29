'use server'

import db from '@/supabase'
import { financeAccount } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import FinanceAccountType from '@/types/finance/account/FinanceAccountType'

export default async function createFinanceAccount(props: FinanceAccountType) {
  const user = await getUser()

  const [result] = await db.insert(financeAccount).values({
    ...props,
    uid: user.id
  }).returning()

  return result
}
