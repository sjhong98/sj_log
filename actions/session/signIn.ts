'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import AuthProps from '@/types/AuthProps'

export default async function signIn({ email, password }: AuthProps) {
  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user && data.session) {
      // 쿠키 설정
      const cookieStore = await cookies()
      cookieStore.set('logToken', data.session.access_token, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      cookieStore.set('refreshToken', data.session.refresh_token, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })

      return { 
        success: true, 
        user: data.user 
      }
    }

    return { success: false, error: '로그인에 실패했습니다.' }
  } catch (error) {
    console.error('로그인 에러:', error)
    return { success: false, error: '서버 오류가 발생했습니다.' }
  }
}
