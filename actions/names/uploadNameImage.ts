'use server'

import db from '@/supabase'
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

export default async function uploadNameImage(namePk: number, imageBase64: string) {
  const user = await getUser()
  if (!user) {
    throw new Error('사용자 인증이 필요합니다.')
  }

  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  try {
    // 랜덤 문자열 생성
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const newBlob = base64ToBlob(imageBase64)
    const MAX_SIZE = 5 * 1024 * 1024
    if (newBlob.size > MAX_SIZE) {
      throw new Error('파일이 5MB를 초과했습니다.')
    }

    // 이미지 업로드
    const { data, error } = await supabase.storage
      .from('sjlog')
      .upload(
        `/public/nameImages/${user.id}/${namePk}_${result}.png`,
        newBlob
      )

    if (error) {
      throw new Error(`이미지 업로드 실패: ${error}`)
    }

    // 공개 URL 가져오기
    const { data: publicUrlData } = await supabase.storage
      .from('sjlog')
      .getPublicUrl(data.path)

    const imageUrl = publicUrlData.publicUrl

    // 데이터베이스에 이미지 URL 저장
    const { error: updateError } = await db
      .from('name')
      .update({ images: imageUrl })
      .eq('pk', namePk)

    if (updateError) {
      console.error('Error updating name image:', updateError)
      throw updateError
    }

    return {
      success: true,
      imageUrl: imageUrl,
      rowCount: 1 // supabase-js doesn't return rowCount, so we assume success
    }

  } catch (error) {
    console.error('이미지 업로드 오류:', error)
    throw error
  }
}
