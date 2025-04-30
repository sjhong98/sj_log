import { User } from '@supabase/auth-js'

export default interface CustomUserProps extends User {
  isRefreshed?: boolean
  newAccessToken?: string
  newRefreshToken?: string
}
