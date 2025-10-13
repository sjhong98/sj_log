'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function getDiaryDetail(pk: number) {
  const user = await getUser()
  if (!user) return

  const { data: diaryItem, error: diaryError } = await db
    .from('diary')
    .select('*')
    .eq('pk', pk)
    .single()

  if (diaryError) {
    console.error('Error fetching diary detail:', diaryError)
    throw diaryError
  }

  const { data: comments, error: commentsError } = await db
    .from('comment')
    .select('*')
    .eq('diary_pk', pk)
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Error fetching comments:', commentsError)
    throw commentsError
  }

  return {
    ...diaryItem,
    comments: comments || []
  }
}
