'use server'

import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { unstable_noStore } from 'next/cache'

export default async function getDevLogByPk(pk: number) {
  unstable_noStore()

  let [devLogData]: any = await db
    .select()
    .from(devLog)
    .where(eq(devLog.pk, pk))
    .limit(1)

    devLogData.group = []

    let parentGroupPk = devLogData.groupPk

  while (true) {
    const [result] = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.pk, parentGroupPk))
    .limit(1)

    devLogData.group.unshift(result)
    parentGroupPk = result.parentGroupPk

    if(!result.parentGroupPk) break
  }
  
  return devLogData || null
} 