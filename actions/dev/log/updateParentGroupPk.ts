'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

export default async function updateParentGroupPk(
  pk: number,
  newGroupPk: number
) {
  const result = await db
    .update(devLog)
    .set({
      groupPk: newGroupPk
    })
    .where(eq(devLog.pk, pk))
  return result.rowCount
}
