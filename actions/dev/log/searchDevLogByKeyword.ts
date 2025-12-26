'use server'

import { getUser } from '@/actions/session/getUser'
import getUserByEmail from '@/actions/user/getUserByEmail'
import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { and, eq, ilike, isNotNull, like } from 'drizzle-orm'
import { headers } from 'next/headers'

export default async function searchDevLogByKeyword(keyword: string, signal?: AbortSignal) {
  let user: any = await getUser()

  let userEmail: string = ''
  if(!user) {
    const headersList = await headers()
    const currentUrl = headersList.get('x-url') || headersList.get('referer') || ''
    userEmail = currentUrl.split('/').pop() ?? ''
  }

  const userId = user ? user.id : (await getUserByEmail(userEmail))?.uid

  // AbortSignal이 제공되고 이미 취소된 경우
  if (signal?.aborted) {
    throw new Error('Search cancelled')
  }

  let whereConditions: any[] = [
    ilike(devLog.text, `%${keyword.trim()}%`),
    eq(devLog.uid, userId), 
    isNotNull(devLog.text)
  ]

  if(!user) {
    whereConditions.push(eq(devLog.isPrivate, false))
  }

  const result: any = await db.select().from(devLog)
  .leftJoin(devLogGroup, eq(devLog.groupPk, devLogGroup.pk))
  .where(
    and(...whereConditions)
  )

  return result.map((item: any) => {
    return {
      ...item.dev_log,
      group: item.dev_log_group ?? null
    }
  })
}
