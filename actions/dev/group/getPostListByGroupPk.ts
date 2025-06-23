'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

export default async function getPostListByGroupPk(groupPk: number) {
  const postList = await db
    .select()
    .from(devLog)
    .where(eq(devLog.groupPk, groupPk))
  return postList
}
