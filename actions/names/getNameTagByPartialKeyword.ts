'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function getNameTagByPartialKeyword(keyword: string) {
  const user = await getUser()
  if (!user) {
    console.log('\n\n\nuser not found')
    return
  }

  // uid 일치하는 nameTagRelation을 통해 연결된 태그들 중에서 키워드가 포함된 태그 리스트 가져오기
  const { data: tags, error } = await db
    .from('name_tag')
    .select('pk, name, created_at')
    .eq('uid', user.id)
    .ilike('name', `%${keyword}%`)
    .limit(10) // 자동완성을 위해 10개로 제한

  if (error) {
    console.error('Error fetching name tags by keyword:', error)
    throw error
  }

  return tags || []
}
