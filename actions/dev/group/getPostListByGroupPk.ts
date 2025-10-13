'use server'

import db from '@/supabase'
import { unstable_noStore } from 'next/cache'

export default async function getPostListByGroupPk(groupPk: number) {
  unstable_noStore()

  const { data: postList, error } = await db
    .from('dev_log')
    .select('pk, title')
    .eq('group_pk', groupPk)
    .order('title', { ascending: false })

  if (error) {
    console.error('Error fetching post list by group pk:', error)
    throw error
  }

  return postList || []
}
