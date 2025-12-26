'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLog, devLogGroup, user } from '@/supabase/schema'
import { and, eq } from 'drizzle-orm'
import { unstable_noStore } from 'next/cache'

export default async function getDevLogByPk(pk: number) {
  unstable_noStore()
  
  const user = await getUser()

  let whereLogConditions: any[] = [eq(devLog.pk, pk)];

  if(!user) whereLogConditions.push(eq(devLog.isPrivate, false));

  let [devLogData]: any = await db
    .select()
    .from(devLog)
    .where(and(...whereLogConditions))
    .limit(1)

    devLogData.group = []

    let parentGroupPk = devLogData.groupPk

  while (true) {
    let whereConditions: any[] = [eq(devLogGroup.pk, parentGroupPk)];
    if(!user) whereConditions.push(eq(devLogGroup.isPrivate, false));

    const [result] = await db
    .select()
    .from(devLogGroup)
    .where(and(...whereConditions))
    .limit(1)

    devLogData.group.unshift(result)
    parentGroupPk = result.parentGroupPk

    if(!result.parentGroupPk) break
  }
  
  return devLogData || null
} 