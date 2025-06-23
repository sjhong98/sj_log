'use server'

import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { getUser } from '@/actions/session/getUser'
import createGroupTree from '@/utils/createGroupTree'

export default async function getAllGroupTree() {
  let user: any = await getUser()
  if (!user) return null

  const allGroupList = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.uid, user.id))

  const newGroupTree = createGroupTree(allGroupList)
  return {
    groupTree: newGroupTree,
    groupList: allGroupList
  }
}
