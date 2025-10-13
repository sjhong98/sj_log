'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { comment, diary } from '@/supabase/schema'
import { and, desc, eq } from 'drizzle-orm'

export default async function getDiaryDetail(pk: number) {
  const user = await getUser()
  if (!user) return

  const [diaryItem] = await db
    .select()
    .from(diary)
    .where(and(eq(diary.uid, user.id), eq(diary.pk, pk)))
    .limit(1)

  const comments = await db
    .select()
    .from(comment)
    .where(eq(comment.diaryPk, pk))
    .orderBy(desc(comment.createdAt))

  return {
    ...diaryItem,
    comments
  }
}
