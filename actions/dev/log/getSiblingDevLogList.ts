'use server'

import db from '@/supabase'

export default async function getSiblingDevLogList(groupPk: number) {
  const { data: updatedSiblingDevLogList, error } = await db
    .from('dev_log')
    .select('*')
    .eq('group_pk', groupPk)

  if (error) {
    console.error('Error fetching sibling dev log list:', error)
    throw error
  }

  return updatedSiblingDevLogList || []
}
