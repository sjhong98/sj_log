'use server'

import db from '@/supabase'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'

export default async function deleteGroup(pk: number) {
  try {
    const { data: deletedGroup, error } = await db
      .from('dev_log_group')
      .delete()
      .eq('pk', pk)
      .select()
      .single()

    if (error) {
      console.error('Error deleting group:', error)
      throw error
    }

    if (!deletedGroup?.parent_group_pk) return
    const updatedGroupTree = await getAllGroupTree()
    return updatedGroupTree?.groupTree
  } catch (e) {
    console.error(e)
  }
}
