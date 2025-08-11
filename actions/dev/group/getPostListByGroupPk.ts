'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { desc, eq } from 'drizzle-orm'

export default async function getPostListByGroupPk(groupPk: number) {
  const postList = await db
    .select()
    .from(devLog)
    .where(eq(devLog.groupPk, groupPk))
    .orderBy(desc(devLog.title))
  return postList
}
