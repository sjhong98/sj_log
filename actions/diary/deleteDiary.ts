'use server'

import DiaryType from '@/types/DiaryType'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

function extractImageSrcFromHtml(content: string) {
  let sources: string[] = []
  const regex = /<img[^>]+src="([^">]+)"/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content ?? '')) !== null) {
    sources.push(match[1])
  }
  return sources
}

export default async function DeleteDiary(diaryItem: DiaryType) {
  const user = await getUser()
  if (!user || !diaryItem.pk) return

  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  //   Delete Image
  const sources = extractImageSrcFromHtml(diaryItem.content ?? '')
  if (sources.length > 0) {
    const deleteImageResult = await supabase.storage
      .from('sjlog')
      .remove(sources)
    if (deleteImageResult.error)
      throw new Error(`이미지 삭제 중 에러 발생: ${deleteImageResult.error}`)
  }

  const { error } = await db
    .from('diary')
    .delete()
    .eq('pk', diaryItem.pk)
    .eq('uid', user.id)

  if (error) {
    console.error('Error deleting diary:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
