'use server'

import db from '@/supabase'

export default async function deleteDevLog(pk: number) {
  const { data: deleted, error } = await db
    .from('dev_log')
    .delete()
    .eq('pk', pk)
    .select()
    .single()

  if (error) {
    console.error('Error deleting dev log:', error)
    throw error
  }

  if (!deleted?.group_pk) return
  return deleted
}
