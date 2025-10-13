'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { devLogType } from '@/types/schemaType'
import { eq } from 'drizzle-orm'

export default async function updateDevLog(devLogItem: devLogType) {
  let user: any = await getUser()
  if (!user || !devLogItem.pk) return null

  try {
    const [result] = await db
      .update(devLog)
      .set({
        title: devLogItem.title,
        content: devLogItem.content,
        text: devLogItem.text,
        updatedAt: new Date().toISOString()
      })
      .where(eq(devLog.pk, devLogItem.pk))
      .returning()
    return result
  } catch (e) {
    console.error(e)
    return null
  }
}
