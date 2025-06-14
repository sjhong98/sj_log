'use server'

import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { getUser } from '@/actions/session/getUser'
import GroupTreeType from '@/types/dev/GroupTreeType'

export default async function getAllGroupTree() {
  let user: any = await getUser()
  if (!user) return null

  let groupList: GroupTreeType[]

  // 최상단 그룹 탐색 (부모 없는 그룹)
  let topGroupList = await db
    .select()
    .from(devLogGroup)
    .where(and(eq(devLogGroup.uid, user.id), isNull(devLogGroup.parentGroupPk)))

  let limiter = 0

  const getLowerGroupList = async (pk?: number) => {
    if (!pk) return

    if (limiter > 100) {
      console.log('\n\n\n==== Limit exceeded ====')
      return
    }

    // 자식 그룹 탐색
    let childGroupList: GroupTreeType[] = await db
      .select()
      .from(devLogGroup)
      .where(eq(devLogGroup.parentGroupPk, pk))

    // 자식 그룹 있을 경우 -> 자식 그룹에 대하여 재귀 실행 후 반환
    if (childGroupList && childGroupList.length > 0) {
      childGroupList = await Promise.all(
        childGroupList.map(async (group: GroupTreeType) => {
          const posts = await db
            .select()
            .from(devLog)
            .where(eq(devLog.groupPk, group?.pk ?? 0))
          limiter++
          const childGroupList = await getLowerGroupList(group.pk)
          return {
            ...group,
            childGroupList,
            posts: posts
          }
        })
      )
      return childGroupList
    }
    // 더이상 자식 그룹 없을 경우 -> 재귀 실행 하지 않고 반환
    else {
      return childGroupList
    }
  }

  groupList = await Promise.all(
    topGroupList.map(async (group: GroupTreeType) => {
      const childGroupList = await getLowerGroupList(group.pk)
      return {
        ...group,
        childGroupList
      }
    })
  )

  return groupList
}
