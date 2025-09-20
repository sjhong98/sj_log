'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq, desc, like } from 'drizzle-orm'

export default async function getNameListByPartialKeyword(keyword: string) {
  const user = await getUser()
  if (!user) return

  const nameList = await db
    .select()
    .from(name)
    .where(and(eq(name.uid, user.id), like(name.name, `%${keyword}%`)))
    .orderBy(desc(name.createdAt))

  return nameList
}
