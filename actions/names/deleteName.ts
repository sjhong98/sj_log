'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function deleteName(pk: number) {
  const user = await getUser()
  if (!user || !pk) return

  const { error } = await db
    .from('name')
    .delete()
    .eq('pk', pk)
    .eq('uid', user.id)

  if (error) {
    console.error('Error deleting name:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
