'use server'

import db from '@/supabase'
import { devLogGroupType } from '@/types/schemaType'
import { getUser } from '@/actions/session/getUser'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'

export default async function createGroup(group: devLogGroupType) {
  try {
    let user: any = await getUser()
    if (!user) return

    const { data: inserted, error } = await db
      .from('dev_log_group')
      .insert({
        name: group.name,
        parent_group_pk: group.parentGroupPk,
        uid: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating group:', error)
      throw new Error('create group failed')
    }

    const updatedGroupTree = await getAllGroupTree()
    return updatedGroupTree?.groupTree
  } catch (e) {
    console.error(e)
    throw new Error('create group failed')
  }
}
