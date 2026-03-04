'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { devLogType } from '@/types/schemaType'
import { revalidateTag } from 'next/cache'
import getDevLogAddress from './getDevLogAddress'

export default async function createDevLog(devLogItem: devLogType) {
  let user: any = await getUser()
  if (!user) return null

  const addressArray: string[] = devLogItem.groupPk ? await getDevLogAddress(devLogItem.groupPk) : []

  try {
    const [inserted] = await db
      .insert(devLog)
      .values({
        title: devLogItem.title,
        content: devLogItem.content,
        groupPk: devLogItem.groupPk,
        date: new Date().toISOString(),
        uid: user.id,
        address: addressArray.join(' > '),
      })
      .returning()

    revalidateTag('dev-log')
    if (!inserted) return
    return inserted
  } catch (e) {
    console.error(e)
    return null
  }
}
