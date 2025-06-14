'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { devLogType } from '@/types/schemaType'

export default async function createDevLog(devLogItem: devLogType) {
  let user: any = await getUser()
  if (!user) return null

  const result = await db.insert(devLog).values({
    title: devLogItem.title,
    content: devLogItem.content,
    groupPk: devLogItem.groupPk,
    date: new Date().toISOString(),
    uid: user.id
  })

  return result.rows
}
