import { createClient } from '@supabase/supabase-js'
import AuthProps from '@/types/AuthProps'
import { deleteCookie, setCookie } from 'cookies-next'
import { toast } from 'react-toastify'

const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY ?? ''
const SUPABASE_URL = 'https://hydhqrohhpgwybhlhwun.supabase.co'

export default function useAuth() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // route handler 로 바꾸기

  const signUp = async ({ email, password }: AuthProps) => {
    let { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.log(error)
    } else {
      console.log(data)
    }
  }

  const signIn = async ({ email, password }: AuthProps) => {
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.log('로그인 에러 : ', error)
      toast.error(error.message)
    } else {
      const { user, session } = data
      setCookie('logToken', session?.access_token, {
        maxAge: 60 * 60 * 24 * 30
      })
      sessionStorage.setItem('userId', email)
      setCookie('refreshToken', session?.refresh_token ?? '', {
        maxAge: 60 * 60 * 24 * 30
      })
      return user
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log(error)
      toast.error(error.message)
    } else {
      deleteCookie('logToken')
      sessionStorage.removeItem('userId')
      sessionStorage.removeItem('refreshToken')
      return true
    }
  }

  return {
    signUp,
    signIn,
    signOut
  }
}
