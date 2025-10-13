'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import createGroupTree from '@/utils/createGroupTree'

export default async function getAllGroupTree() {
  let user: any = await getUser()
  if (!user) return null

  const { data: allGroupList, error } = await db
    .from('dev_log_group')
    .select('*')
    .eq('uid', user.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching group tree:', error)
    throw error
  }

  const newGroupTree = createGroupTree(allGroupList || [])
  return {
    groupTree: newGroupTree,
    groupList: allGroupList || []
  }
}
