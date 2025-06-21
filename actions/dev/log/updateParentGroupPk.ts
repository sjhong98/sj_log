'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import getSiblingDevLogList from '@/actions/dev/log/getSiblingDevLogList'

export default async function updateParentGroupPk(
  pk: number,
  newGroupPk: number
) {
  const [updated] = await db
    .update(devLog)
    .set({
      groupPk: newGroupPk
    })
    .where(eq(devLog.pk, pk))
    .returning()

  if (!updated) return
  return updated
}
