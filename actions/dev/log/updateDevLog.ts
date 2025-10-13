'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import { devLogType } from '@/types/schemaType'

export default async function updateDevLog(devLogItem: devLogType) {
  let user: any = await getUser()
  if (!user || !devLogItem.pk) return null

  try {
    const { data: result, error } = await db
      .from('dev_log')
      .update({
        title: devLogItem.title,
        content: devLogItem.content,
        text: devLogItem.text,
        updated_at: new Date().toISOString()
      })
      .eq('pk', devLogItem.pk)
      .select()
      .single()

    if (error) {
      console.error('Error updating dev log:', error)
      return null
    }

    return result
  } catch (e) {
    console.error(e)
    return null
  }
}
