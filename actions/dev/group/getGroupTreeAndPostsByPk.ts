'use server'

// 자신의 상위에 있는 모든 Groups + 자신의 한 단계 하위에 있는 Groups 조회
import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import { getUser } from '@/actions/session/getUser'

async function getUpperGroupList(pk: number) {
  let upperGroupList: devLogGroupType[] = []

  let [currentGroup]: devLogGroupType[] = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.pk, pk))
    .limit(1)

  while (true) {
    // currentGroup === topGroup 인 경우 -> 현재 상태 리턴
    if (!currentGroup.parentGroupPk) return null

    let [upperGroup] = await db
      .select()
      .from(devLogGroup)
      .where(eq(devLogGroup.pk, currentGroup.parentGroupPk))
      .limit(1)

    if (!upperGroup) throw new Error('상위 그룹을 찾을 수 없습니다.')

    // 조부가 없을 경우 -> 탐색 종료
    if (!upperGroup.parentGroupPk) {
      upperGroupList.unshift(upperGroup)
      return upperGroupList
    } else {
      upperGroupList.unshift(upperGroup)
      currentGroup = upperGroup
    }
  }
}

async function getCurrentGroup(pk: number) {
  const [currentGroup]: devLogGroupType[] = await db
    .select()
    .from(devLogGroup)
    .where(eq(devLogGroup.pk, pk))
    .limit(1)

  const posts: devLogType[] = await db
    .select()
    .from(devLog)
    .where(eq(devLog.groupPk, pk))
  return {
    currentGroup,
    posts
  }
}

async function getLowerGroupList(pk: number) {
  return db.select().from(devLogGroup).where(eq(devLogGroup.parentGroupPk, pk))
}

export default async function getGroupTreeAndPostsByPk(pk: number) {
  let user: any = await getUser()
  if (!user) return null

  const { currentGroup, posts } = await getCurrentGroup(pk)

  return {
    currentGroup,
    posts,
    // stack
    upperGroupList: await getUpperGroupList(pk),
    lowerGroupList: await getLowerGroupList(pk)
  }
}
