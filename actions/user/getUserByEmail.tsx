import db from "@/supabase"
import { user } from "@/supabase/schema"
import { eq } from "drizzle-orm"

const getUserByEmail = async (id: string) => {
  const params = new URLSearchParams()
  params.set('id', `eq.${id}`)
  const result = await fetch(`${process.env.SUPABASE_REST_URL}/user?${params.toString()}`, {
    headers: {
      'apikey': process.env.SUPABASE_KEY ?? '',
      'Authorization': `Bearer ${process.env.SUPABASE_KEY ?? ''}`
    },
    cache: 'force-cache',
    next: {
      tags: ['user']
    }
  })
  const userInfo = await result.json()
  return userInfo?.[0] ?? null
}

export default getUserByEmail