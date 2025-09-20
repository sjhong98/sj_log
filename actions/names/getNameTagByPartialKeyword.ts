'use server'

import db from '@/supabase'
import { nameTag } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq, like } from 'drizzle-orm'

export default async function getNameTagByPartialKeyword(keyword: string) {
  const user = await getUser()
  if (!user) {
    console.log('\n\n\nuser not found')
    return
  }


  // uid 일치하는 nameTagRelation을 통해 연결된 태그들 중에서 키워드가 포함된 태그 리스트 가져오기
  const tags = await db
    .select({
      pk: nameTag.pk,
      name: nameTag.name,
      createdAt: nameTag.createdAt
    })
    .from(nameTag)
    .where(and(
      eq(nameTag.uid, user.id),
      like(nameTag.name, `%${keyword}%`)
    ))
    .limit(10) // 자동완성을 위해 10개로 제한

  return tags
}
