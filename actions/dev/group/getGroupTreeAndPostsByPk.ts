'use server'

// 자신의 상위에 있는 모든 Groups + 자신의 한 단계 하위에 있는 Groups 조회
import db from '@/supabase'
import { devLog, devLogGroup } from '@/supabase/schema'
import { and, eq, isNull } from 'drizzle-orm'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import { getUser } from '@/actions/session/getUser'
import { headers } from 'next/headers'
import getUserByEmail from '@/actions/user/getUserByEmail'

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

export default async function getGroupTreeAndPostsByPk(pk?: number) {
  let user: any = await getUser()

  let userEmail: string = ''
  if(!user) {
    const headersList = await headers()
    const currentUrl = headersList.get('x-url') || headersList.get('referer') || ''
    userEmail = currentUrl.split('/').pop() ?? ''
  }

  const userId = user ? user.id : (await getUserByEmail(userEmail))?.uid

  // pk 가 없는 경우 -> 아무 group 도 지정되지 않은 상태 -> 최상단 groupList 반환
  if (!pk) {
    let whereConditions: any[] = [eq(devLogGroup.uid, userId), isNull(devLogGroup.parentGroupPk)];
    // 비로그인 회원 -> 공개된 그룹만 조회
    if(!user) whereConditions.push(eq(devLogGroup.isPrivate, false));

    const topGroupList: devLogGroupType[] = await db
      .select()
      .from(devLogGroup)
      .where(
        and(...whereConditions)
      )
      .limit(1)

    return {
      currentGroup: null,
      posts: [],
      upperGroupList: null,
      lowerGroupList: topGroupList
    }
  }

  const { currentGroup, posts } = await getCurrentGroup(pk)

  return {
    currentGroup,
    posts,
    upperGroupList: null,
    lowerGroupList: await getLowerGroupList(pk)
  }
}
