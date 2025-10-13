'use server'

import db from '@/supabase'
import { comment } from '@/supabase/schema'
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

  const result = await db.insert(comment).values({
    uid: user.id,
    diaryPk,
    content
  })

  return result.rowCount
}
