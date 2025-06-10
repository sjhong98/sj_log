'use server'

import DiaryType from '@/types/DiaryType'
import { createClient } from '@supabase/supabase-js'
import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { eq } from 'drizzle-orm'
import { diary } from '@/supabase/schema'

function extractImageSrcFromHtml(content: string) {
  let sources: string[] = []
  while (true) {
    const str1 = content.split(
      '<img src="https://hydhqrohhpgwybhlhwun.supabase.co/storage/v1/object/public/sjlog/'
    )
    if (!str1?.[1]) return []
    const str2 = str1[1].split('"')
    const src = str2[0]

    sources.push(src)

    if (!str2[1].includes('<img src="')) break
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
    console.log(sources)
    const deleteImageResult = await supabase.storage
      .from('sjlog')
      .remove(sources)
    console.log(deleteImageResult)
    if (deleteImageResult.error)
      throw new Error(`이미지 삭제 중 에러 발생: ${deleteImageResult.error}`)
  }

  const result = await db.delete(diary).where(eq(diary.pk, diaryItem.pk))
  return result.rowCount
}
