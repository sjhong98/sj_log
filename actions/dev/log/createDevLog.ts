'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import { devLogType } from '@/types/schemaType'

export default async function createDevLog(devLogItem: devLogType) {
  let user: any = await getUser()
  if (!user) return null

  try {
    const { data: inserted, error } = await db
      .from('dev_log')
      .insert({
        title: devLogItem.title,
        content: devLogItem.content,
        group_pk: devLogItem.groupPk,
        date: new Date().toISOString(),
        uid: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating dev log:', error)
      return null
    }

    if (!inserted) return null
    return inserted
  } catch (e) {
    console.error(e)
    return null
  }
}
