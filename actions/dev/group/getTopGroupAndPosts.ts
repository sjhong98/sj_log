'use server'

import { getUser } from '@/actions/session/getUser'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

export default async function getTopGroupAndPosts() {
  let user: any = await getUser()
  if (!user) return

  const topGroupList: devLogGroupType[] = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.uid, user.id))
    .limit(1)

  return {
    currentGroup: null,
    posts: [],
    upperGroupList: null,
    lowerGroupList: topGroupList
  }
}
