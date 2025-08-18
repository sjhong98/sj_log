'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import createGroupTree from '@/utils/createGroupTree'
import { asc, eq } from 'drizzle-orm'

export default async function getAllGroupTree() {
  let user: any = await getUser()
  if (!user) return null

  const allGroupList = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.uid, user.id))
    .orderBy(asc(devLogGroup.name))

  const newGroupTree = createGroupTree(allGroupList)
  return {
    groupTree: newGroupTree,
    groupList: allGroupList
  }
}
