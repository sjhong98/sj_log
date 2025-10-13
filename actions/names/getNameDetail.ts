'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function getNameDetail(pk: number) {
  const user = await getUser()
  if (!user) return

  const { data: nameItem, error: nameError } = await db
    .from('name')
    .select('*')
    .eq('uid', user.id)
    .eq('pk', pk)
    .single()

  if (nameError) {
    console.error('Error fetching name detail:', nameError)
    throw nameError
  }

  // 태그 정보도 함께 가져오기
  const { data: tags, error: tagsError } = await db
    .from('name_tag_relation')
    .select(`
      name_tag (
        pk,
        name,
        created_at
      )
    `)
    .eq('name_pk', pk)
    .eq('name_tag.uid', user.id)

  if (tagsError) {
    console.error('Error fetching name tags:', tagsError)
    throw tagsError
  }

  return {
    ...nameItem,
    tags: tags?.map((item: any) => item.name_tag) || []
  }
}
