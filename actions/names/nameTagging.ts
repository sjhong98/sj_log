'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

interface NameTaggingData {
  namePk: number
  tagName: string
}

export default async function nameTagging(taggingData: NameTaggingData) {
  const { namePk, tagName } = taggingData

  const user = await getUser()
  if (!user) return

  // uid 일치하는 nameTag 중에서 동일한 name을 가진 태그가 있는지 확인
  const { data: existingTag, error: existingTagError } = await db
    .from('name_tag')
    .select('*')
    .eq('name', tagName)
    .eq('uid', user.id)
    .single()

  if (existingTagError && existingTagError.code !== 'PGRST116') {
    console.error('Error checking existing tag:', existingTagError)
    throw existingTagError
  }

  let tagPk: number

  if (existingTag) {
    // 기존 태그가 있으면 해당 태그 사용
    tagPk = existingTag.pk
  } else {
    console.log('\n\n\ntagName', tagName)
    // 기존 태그가 없으면 새로 생성
    const { data: newTag, error: newTagError } = await db
      .from('name_tag')
      .insert({
        name: tagName,
        uid: user.id
      })
      .select()
      .single()
    
    if (newTagError) {
      console.error('Error creating new tag:', newTagError)
      throw newTagError
    }
    
    tagPk = newTag.pk
  }

  // nameTagRelation에 연결 정보 추가 (중복 체크)
  const { data: existingRelation, error: relationCheckError } = await db
    .from('name_tag_relation')
    .select('*')
    .eq('name_pk', namePk)
    .eq('tag_pk', tagPk)
    .single()

  if (relationCheckError && relationCheckError.code !== 'PGRST116') {
    console.error('Error checking existing relation:', relationCheckError)
    throw relationCheckError
  }

  if (!existingRelation) {
    const { error: insertError } = await db
      .from('name_tag_relation')
      .insert({
        name_pk: namePk,
        tag_pk: tagPk
      })
    
    if (insertError) {
      console.error('Error creating name tag relation:', insertError)
      throw insertError
    }
    
    return 1
  }

  return 0 // 이미 연결되어 있음
}
