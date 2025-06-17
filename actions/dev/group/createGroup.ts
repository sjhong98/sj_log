'use server'

import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import { devLogGroupType } from '@/types/schemaType'
import { getUser } from '@/actions/session/getUser'

export default async function createGroup(group: devLogGroupType) {
  try {
    let user: any = await getUser()
    if (!user) return

    const [result] = await db
      .insert(devLogGroup)
      .values({
        name: group.name,
        parentGroupPk: group.parentGroupPk,
        uid: user.id
      })
      .returning()

    return result
  } catch (e) {
    console.error(e)
    throw new Error('create group failed')
  }
}
