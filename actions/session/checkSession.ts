'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { refreshSession } from '@/actions/session/refreshSession'

export const checkSession = async (accessToken?: any) => {
  const cookie = await cookies()
  const currentCookie: any = cookie.get('logToken')
  if (!currentCookie || !currentCookie.name || !currentCookie.value) {
    return
  }
  const _accessToken = accessToken ?? currentCookie?.value ?? ''

  const SUPABASE_KEY = process.env.SUPABASE_KEY ?? ''
  const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  let user = await supabase.auth.getUser(_accessToken)
  let returnData: any = {}

  if (user.error) {
    // refresh token
    const newSession = await refreshSession()
    user = await supabase.auth.getUser(newSession?.newAccessToken)

    returnData = {
      ...user.data.user,
      newSession
    }
  } else {
    returnData = user.data.user
  }

  if (user.data.user) return returnData
  else return null
}
