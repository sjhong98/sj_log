'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq, desc } from 'drizzle-orm'

export default async function getNameList({filter}: {filter?: string}) {
  const user = await getUser()
  if (!user) return

  let orderByCondition = desc(name.createdAt)

  const nameList = await db
    .select()
    .from(name)
    .where(eq(name.uid, user.id))
    .orderBy(orderByCondition)

  return nameList
}
