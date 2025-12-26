'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { and, desc, eq } from 'drizzle-orm'
import { unstable_noStore } from 'next/cache'

export default async function getPostListByGroupPk(groupPk: number) {
  unstable_noStore()

  const user = await getUser()

  let whereConditions: any[] = [eq(devLog.groupPk, groupPk)];
  if(!user) whereConditions.push(eq(devLog.isPrivate, false));

  const postList = await db
    .select({
      pk: devLog.pk,
      title: devLog.title
    })
    .from(devLog)
    .where(and(...whereConditions))
    .orderBy(desc(devLog.title))
  return postList
}
