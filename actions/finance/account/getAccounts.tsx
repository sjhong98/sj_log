'use server'

import db from '@/supabase'
import { financeAccount } from '@/supabase/schema'
import { and, asc, eq } from 'drizzle-orm'
import { getUser } from '@/actions/session/getUser'

export default async function getAccounts() {
  const user = await getUser()
  if (!user) return

  return db
    .select()
    .from(financeAccount)
    .where(and(eq(financeAccount.uid, user.id)))
    .orderBy(asc(financeAccount.createdAt))
}
