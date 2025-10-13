'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

interface NameUntaggingData {
  namePk: number
  tagPk: number
}

export default async function nameUntagging(untaggingData: NameUntaggingData) {
  const { namePk, tagPk } = untaggingData

  const user = await getUser()
  if (!user) return

  // nameTagRelation에서 해당 연결 제거
  const { error } = await db
    .from('name_tag_relation')
    .delete()
    .eq('name_pk', namePk)
    .eq('tag_pk', tagPk)

  if (error) {
    console.error('Error removing name tag relation:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
