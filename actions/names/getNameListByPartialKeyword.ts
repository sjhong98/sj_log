'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq, desc, like, or } from 'drizzle-orm'

export default async function getNameListByPartialKeyword(keyword: string) {
  const user = await getUser()
  if (!user) return

  const nameList = await db
    .select()
    .from(name)
    .where(
      and(
        eq(name.uid, user.id), 
        or(
          like(name.name, `%${keyword}%`), 
          like(name.subname, `%${keyword}%`)
        )
      )
    )
    .orderBy(desc(name.createdAt))

  return nameList
}
