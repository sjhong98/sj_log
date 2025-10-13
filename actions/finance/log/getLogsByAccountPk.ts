'use server'

import { financeLog } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, asc, eq } from 'drizzle-orm'
import db from '@/supabase'

export default async function getLogsByAccountPk(accountPk: number) {
  const user = await getUser()
  if (!user) return

  const logs = await db
    .select()
    .from(financeLog)
    .where(
      and(
        eq(financeLog.financeAccountPk, accountPk),
        eq(financeLog.uid, user.id)
      )
    )
    .orderBy(asc(financeLog.date))

  return logs
} 