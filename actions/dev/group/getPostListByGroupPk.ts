'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { desc, eq } from 'drizzle-orm'
import { unstable_noStore } from 'next/cache'

export default async function getPostListByGroupPk(groupPk: number) {
  unstable_noStore()

  const postList = await db
    .select()
    .from(devLog)
    .where(eq(devLog.groupPk, groupPk))
    .orderBy(desc(devLog.title))
  return postList
}
