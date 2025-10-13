'use server'

// 자신의 상위에 있는 모든 Groups + 자신의 한 단계 하위에 있는 Groups 조회
import db from '@/supabase'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import { getUser } from '@/actions/session/getUser'

async function getCurrentGroup(pk: number) {
  const { data: currentGroup, error: currentGroupError } = await db
    .from('dev_log_group')
    .select('*')
    .eq('pk', pk)
    .single()

  if (currentGroupError) {
    throw new Error('현재 그룹을 찾을 수 없습니다.')
  }

  const { data: posts, error: postsError } = await db
    .from('dev_log')
    .select('*')
    .eq('group_pk', pk)

  if (postsError) {
    throw new Error('포스트를 찾을 수 없습니다.')
  }

  return {
    currentGroup,
    posts: posts || []
  }
}

async function getLowerGroupList(pk: number) {
  const { data: lowerGroups, error } = await db
    .from('dev_log_group')
    .select('*')
    .eq('parent_group_pk', pk)

  if (error) {
    throw new Error('하위 그룹을 찾을 수 없습니다.')
  }

  return lowerGroups || []
}

export default async function getGroupTreeAndPostsByPk(pk?: number) {
  let user: any = await getUser()
  if (!user) return null

  // pk 가 없는 경우 -> 아무 group 도 지정되지 않은 상태 -> 최상단 groupList 반환
  if (!pk) {
    const { data: topGroupList, error: topGroupError } = await db
      .from('dev_log_group')
      .select('*')
      .eq('uid', user.id)
      .is('parent_group_pk', null)

    if (topGroupError) {
      throw new Error('최상단 그룹을 찾을 수 없습니다.')
    }

    return {
      currentGroup: null,
      posts: [],
      upperGroupList: null,
      lowerGroupList: topGroupList || []
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
