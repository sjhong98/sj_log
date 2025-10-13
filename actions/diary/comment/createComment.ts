'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import { refreshSession } from '@/actions/session/refreshSession'

export default async function createComment({
  content,
  diaryPk
}: {
  content: string
  diaryPk: number
}) {
  const user = await getUser()

  const { error } = await db
    .from('comment')
    .insert({
      uid: user.id,
      diary_pk: diaryPk,
      content
    })

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
