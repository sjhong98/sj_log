'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export default async function signOut() {
  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  try {
    // 쿠키에서 토큰 가져오기
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('logToken')?.value

    if (accessToken) {
      // Supabase에서 로그아웃
      await supabase.auth.signOut()
    }

    // 쿠키 삭제
    cookieStore.delete('logToken')
    cookieStore.delete('refreshToken')

    return { success: true }
  } catch (error) {
    console.error('로그아웃 에러:', error)
    return { success: false, error: '로그아웃 중 오류가 발생했습니다.' }
  }
}
