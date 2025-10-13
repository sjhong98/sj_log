'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function Get(tableName: string) {
  const user = await getUser()
  if (!user) return

  const list: any = async (conditions?: any) => {
    let query = db.from(tableName).select('*').eq('uid', user.id)
    
    // Add additional conditions if provided
    if (conditions) {
      Object.entries(conditions).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error(`Error fetching list from ${tableName}:`, error)
      throw error
    }
    
    return data || []
  }

  const detail = async ({ pk }: { pk?: number }) => {
    let query = db.from(tableName).select('*').eq('uid', user.id)
    
    if (pk) query = query.eq('pk', pk)
    
    const { data, error } = await query.single()
    
    if (error) {
      console.error(`Error fetching detail from ${tableName}:`, error)
      throw error
    }
    
    return data
  }

  return { detail, list }
}
