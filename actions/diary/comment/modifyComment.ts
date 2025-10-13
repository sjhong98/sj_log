'use server'

import db from '@/supabase'
import { comment } from '@/supabase/schema'
import { and, eq } from 'drizzle-orm'
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

  const result = await db
    .update(comment)
    .set({
      content
    })
    .where(and(eq(comment.uid, user.id), eq(comment.pk, commentPk)))

  return result.rowCount
}
