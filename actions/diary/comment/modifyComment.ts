'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import { refreshSession } from '@/actions/session/refreshSession'

export default async function modifyComment({
  content,
  commentPk
}: {
  content: string
  commentPk: number
}) {
  const user = await getUser()

  const { error } = await db
    .from('comment')
    .update({
      content
    })
    .eq('uid', user.id)
    .eq('pk', commentPk)

  if (error) {
    console.error('Error modifying comment:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
