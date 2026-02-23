'use server'

import { getUser } from '@/actions/session/getUser'
import getUserByEmail from '@/actions/user/getUserByEmail'
import { devLogGroup } from '@/supabase/schema'
import createGroupTree from '@/utils/createGroupTree'
import snakeToCamel from '@/utils/snakeToCamel'
import { eq } from 'drizzle-orm'

export default async function getAllGroupTree(userEmailParam: string) {
  try {
    let user: any = await getUser()

    let userEmail: string = userEmailParam

    const userId = user ? user.id : (await getUserByEmail(userEmail))?.uid

    const params = new URLSearchParams()
    params.set('uid', `eq.${userId}`)
    params.set('order', 'created_at.desc')

    // 비로그인 회원 -> 공개된 그룹만 조회
    if (!user) params.set('is_private', 'eq.false')

    const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log_group?${params.toString()}`, {
      headers: {
        'apikey': process.env.SUPABASE_KEY ?? '',
        'Authorization': `Bearer ${process.env.SUPABASE_KEY ?? ''}`
      },
      cache: 'force-cache',
      next: {
        tags: ['dev-log-group']
      }
    })
    let allGroupList = await result.json()
    allGroupList = snakeToCamel(allGroupList)

    console.log('allGroupList', allGroupList)

    const newGroupTree = createGroupTree(allGroupList)

    return {
      groupTree: newGroupTree,
      groupList: allGroupList
    }
  } catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to get all group tree')
  }
}
