'use server'

import db from '@/supabase'
import getSiblingDevLogList from '@/actions/dev/log/getSiblingDevLogList'

export default async function updateParentGroupPk(
  pk: number,
  newGroupPk: number
) {
  const { data: updated, error } = await db
    .from('dev_log')
    .update({
      group_pk: newGroupPk
    })
    .eq('pk', pk)
    .select()
    .single()

  if (error) {
    console.error('Error updating parent group pk:', error)
    throw error
  }

  if (!updated) return
  return updated
}
