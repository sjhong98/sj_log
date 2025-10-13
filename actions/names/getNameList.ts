'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { name } from '@/supabase/schema'
import { count, desc, eq } from 'drizzle-orm'

export default async function getNameList({ filter }: { filter?: string }) {
  try {
    const user = await getUser()
    if (!user) return

    let orderByCondition = desc(name.createdAt)

    const nameList = await db
      .select()
      .from(name)
      .where(eq(name.uid, user.id))
      .orderBy(orderByCondition)

    const total = await db
      .select({ count: count() })
      .from(name)
      .where(eq(name.uid, user.id))

    return {
      nameList,
      total: total[0]?.count ?? 0
    }
  } catch (error) {
    throw error
  }
}
