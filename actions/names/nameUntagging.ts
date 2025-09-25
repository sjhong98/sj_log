'use server'

import db from '@/supabase'
import { nameTagRelation } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq } from 'drizzle-orm'

interface NameUntaggingData {
  namePk: number
  tagPk: number
}

export default async function nameUntagging(untaggingData: NameUntaggingData) {
  const { namePk, tagPk } = untaggingData

  const user = await getUser()
  if (!user) return

  // nameTagRelation에서 해당 연결 제거
  const result = await db
    .delete(nameTagRelation)
    .where(and(
      eq(nameTagRelation.namePk, namePk),
      eq(nameTagRelation.tagPk, tagPk)
    ))

  return result.rowCount
}
