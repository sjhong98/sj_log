'use server'

import { getUser } from '@/actions/session/getUser'
import getUserByEmail from '@/actions/user/getUserByEmail'
import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import createGroupTree from '@/utils/createGroupTree'
import { and, asc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export default async function getAllGroupTree(userEmailParam?: string) {
  let user: any = await getUser()

  let userEmail: string = userEmailParam || ''
  if(!user && !userEmail) {
    const headersList = await headers()
    const currentUrl = headersList.get('x-url') || headersList.get('referer') || ''
    userEmail = currentUrl.split('/').pop() ?? ''
  }

  const userId = user ? user.id : (await getUserByEmail(userEmail))?.uid

  let whereConditions: any[] = [eq(devLogGroup.uid, userId)];
  // 비로그인 회원 -> 공개된 그룹만 조회
  if(!user) whereConditions.push(eq(devLogGroup.isPrivate, false));

  const allGroupList = await db
    .select()
    .from(devLogGroup)
    .where(and(...whereConditions))
    .orderBy(asc(devLogGroup.name))

  const newGroupTree = createGroupTree(allGroupList)
  return {
    groupTree: newGroupTree,
    groupList: allGroupList
  }
}
