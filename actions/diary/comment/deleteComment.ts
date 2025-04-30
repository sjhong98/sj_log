'use server'

import db from '@/supabase'
import { comment } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq } from 'drizzle-orm'
import { refreshSession } from '@/actions/session/refreshSession'

export default async function deleteComment({
  commentPk
}: {
  commentPk: number
}) {
  const user = await getUser()

  const result = await db
    .delete(comment)
    .where(and(eq(comment.uid, user.id), eq(comment.pk, commentPk)))
  return result.rowCount
}
