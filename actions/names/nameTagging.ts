'use server'

import db from '@/supabase'
import { nameTag, nameTagRelation } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq } from 'drizzle-orm'

interface NameTaggingData {
  namePk: number
  tagName: string
}

export default async function nameTagging(taggingData: NameTaggingData) {
  const { namePk, tagName } = taggingData

  const user = await getUser()
  if (!user) return

  // uid 일치하는 nameTag 중에서 동일한 name을 가진 태그가 있는지 확인
  const [existingTag] = await db
    .select()
    .from(nameTag)
    .where(and(
      eq(nameTag.name, tagName),
      eq(nameTag.uid, user.id)
    ))
    .limit(1)

  let tagPk: number

  if (existingTag) {
    // 기존 태그가 있으면 해당 태그 사용
    tagPk = existingTag.pk
  } else {

    // 기존 태그가 없으면 새로 생성
    const [newTag] = await db
      .insert(nameTag)
      .values({
        name: tagName,
        uid: user.id
      })
      .returning()
    
    tagPk = newTag.pk
  }

  // nameTagRelation에 연결 정보 추가 (중복 체크)
  const [existingRelation] = await db
    .select()
    .from(nameTagRelation)
    .where(and(
      eq(nameTagRelation.namePk, namePk),
      eq(nameTagRelation.tagPk, tagPk)
    ))
    .limit(1)

  if (!existingRelation) {
    const result = await db
      .insert(nameTagRelation)
      .values({
        namePk,
        tagPk
      })
    
    return result.rowCount
  }

  return 0 // 이미 연결되어 있음
}
