'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function Delete(
  tableName: string,
  pk: number,
  options?: {
    conditions?: any
  }
) {
  try {
    const user = await getUser()
    if (!user) return

    let query = db.from(tableName).delete().eq('pk', pk).eq('uid', user.id)

    // Add additional conditions if provided
    if (options?.conditions) {
      Object.entries(options.conditions).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    const { error } = await query

    if (error) {
      console.error(`Error deleting from ${tableName}:`, error)
      throw error
    }

    return 1 // supabase-js doesn't return rowCount, so we assume success
  } catch (error) {
    console.error(error)
    throw new Error(`Error occurred while deleting from ${tableName}`)
  }
}
