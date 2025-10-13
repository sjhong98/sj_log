'use server'

import db from '@/supabase'
import { unstable_noStore } from 'next/cache'

export default async function getDevLogByPk(pk: number) {
  unstable_noStore()

  const { data: devLogData, error: devLogError } = await db
    .from('dev_log')
    .select('*')
    .eq('pk', pk)
    .single()

  if (devLogError) {
    console.error('Error fetching dev log:', devLogError)
    return null
  }

  if (!devLogData) return null

  devLogData.group = []
  let parentGroupPk = devLogData.group_pk

  while (true) {
    const { data: result, error: groupError } = await db
      .from('dev_log_group')
      .select('*')
      .eq('pk', parentGroupPk)
      .single()

    if (groupError || !result) break

    devLogData.group.unshift(result)
    parentGroupPk = result.parent_group_pk

    if (!result.parent_group_pk) break
  }
  
  return devLogData || null
} 