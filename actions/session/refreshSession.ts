'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export const refreshSession = async () => {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')

  if (!refreshToken) {
    console.error('no refresh token')
    return
  }

  const supabase = createClient(
    'https://hydhqrohhpgwybhlhwun.supabase.co',
    process.env.SUPABASE_KEY!
  )
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken.value
  })

  if (error) {
    console.error('\n\n\nError at refreshSession.ts:24 : ', error)
    return
  }

  const { session } = data

  console.log(
    '\n\n\n====== Session Refreshed Successfully ======\n\nAccess Token : ',
    session?.access_token,
    '\nRefresh Token : ',
    session?.refresh_token,
    '\n\n\n'
  )

  return {
    newAccessToken: session?.access_token ?? '',
    newRefreshToken: session?.refresh_token ?? ''
  }
}
