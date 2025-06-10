'use server'

import db from '@/supabase'
import { diary } from '@/supabase/schema'
import DiaryType from '@/types/DiaryType'
import { getUser } from '@/actions/session/getUser'
import { createClient } from '@supabase/supabase-js'

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

  return content.replace(
    /<img\s+[^>]*src="data:image\/[^"]+"[^>]*>/gi,
    match => {
      const replacement = match.replace(
        /src="data:image\/[^"]+"/i,
        `src="${sources[i]?.url ?? ''}"`
      )
      i++
      return replacement
    }
  )
}

export default async function createDiary(diaryData: DiaryType) {
  const { title, content, contentText, date } = diaryData

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

  try {
    await Promise.all(
      sources.map(async (source: any, i: number) => {
        // create random string
        const chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 10; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        const newBlob = base64ToBlob(source)
        const MAX_SIZE = 5 * 1024 * 1024
        if (newBlob.size > MAX_SIZE) {
          throw new Error('파일이 5MB를 초과했습니다.')
        }
        const { data, error } = await supabase.storage
          .from('sjlog')
          .upload(
            `/public/diaryImages/${user.id}/${date.toISOString()}_${result}.png`,
            newBlob
          )

        if (error) {
          console.log('\n\n\n에러발생 \n\n\n')
          throw new Error(`${error}`)
        }

        const { path, id, fullPath } = data

        const getPublicUrlResult = await supabase.storage
          .from('sjlog')
          .getPublicUrl(`${path}`)

        sources[i] = {
          source,
          url: getPublicUrlResult.data.publicUrl
        }
      })
    )
  } catch (e) {
    console.log('\n\n\n에러발생\n\n\n')
    console.error(e)
  }

  let replacedContent = replaceBase64Images(content ?? '', sources)

  const result = await db.insert(diary).values({
    title,
    content: replacedContent,
    contentText,
    date: date.toISOString(),
    uid: user.id,
    thumbnail: sources?.[0]?.url ?? ''
  })

  return result.rowCount
}
