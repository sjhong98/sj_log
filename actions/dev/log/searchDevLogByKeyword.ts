'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { and, eq, ilike, isNotNull, like } from 'drizzle-orm'

export default async function searchDevLogByKeyword(keyword: string, signal?: AbortSignal) {
  let user: any = await getUser()
  if (!user) return null

  console.log('keyword', keyword)

  // AbortSignal이 제공되고 이미 취소된 경우
  if (signal?.aborted) {
    throw new Error('Search cancelled')
  }

  return await db.select().from(devLog).where(
    and(
      ilike(devLog.text, `%${keyword.trim()}%`),
      eq(devLog.uid, user.id), 
      isNotNull(devLog.text)
    )
  )
}
