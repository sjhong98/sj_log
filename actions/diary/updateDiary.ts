'use server'

import db from '@/supabase'
import DiaryType from '@/types/DiaryType'
import { getUser } from '@/actions/session/getUser'
import { createClient } from '@supabase/supabase-js'
import { refreshSession } from '@/actions/session/refreshSession'

function base64ToBlob(base64: string, mime = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1])
  const byteArrays = []

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512)
    const byteNumbers = new Array(slice.length)
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j)
    }
    byteArrays.push(new Uint8Array(byteNumbers))
  }

  return new Blob(byteArrays, { type: mime })
}

function replaceBase64Images(
  content: string,
  sources: { url: string }[]
): string {
  let i = 0

  return content.replace(/<img\s+[^>]*src="[^"]*"[^>]*>/gi, match => {
    const replacement = match.replace(
      /src="[^"]*"/i,
      `src="${sources[i]?.url ?? ''}"`
    )
    i++
    return replacement
  })
}

export default async function updateDiary(diaryData: DiaryType) {
  const { pk, title, content, contentText, date } = diaryData

  if (!pk) return

  const user = await getUser()
  if (!user) return

  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // 사진 upload 로직
  const regex = /<img[^>]+src="([^">]+)"/g
  let sources: any[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content ?? '')) !== null) {
    sources.push(match[1])
  }

  await Promise.all(
    sources.map(async (source: any, i: number) => {
      try {
        if (source.startsWith('https://')) {
          sources[i] = {
            source,
            url: source
          }
        } else {
          // create random string
          const chars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          let result = ''
          for (let i = 0; i < 10; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
          }

          const newBlob = base64ToBlob(source)
          const { data, error } = await supabase.storage
            .from('sjlog')
            .upload(
              `/public/diaryImages/${user.id}/${date.toISOString()}_${result}.png`,
              newBlob
            )

          if (error) {
            console.log(error)
            return
          }

          const { path, id, fullPath } = data

          const getPublicUrlResult = await supabase.storage
            .from('sjlog')
            .getPublicUrl(`${path}`)

          sources[i] = {
            source,
            url: getPublicUrlResult.data.publicUrl
          }

          sources.forEach((s: any) => {
            console.log(s.url)
          })
        }
      } catch (e) {
        throw new Error(`일기 생성 실패 : ${e}`)
      }
    })
  )

  let replacedContent = replaceBase64Images(content ?? '', sources)

  const { error } = await db
    .from('diary')
    .update({
      title,
      content: replacedContent,
      content_text: contentText,
      date: date.toISOString(),
      uid: user.id,
      thumbnail: sources?.[0]?.url ?? ''
    })
    .eq('uid', user.id)
    .eq('pk', pk)

  if (error) {
    console.error('Error updating diary:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
