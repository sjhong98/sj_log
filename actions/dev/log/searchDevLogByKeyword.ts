'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function searchDevLogByKeyword(keyword: string, signal?: AbortSignal) {
  let user: any = await getUser()
  if (!user) return null

  console.log('keyword', keyword)

  // AbortSignal이 제공되고 이미 취소된 경우
  if (signal?.aborted) {
    throw new Error('Search cancelled')
  }

  const { data: result, error } = await db
    .from('dev_log')
    .select(`
      *,
      dev_log_group (*)
    `)
    .ilike('text', `%${keyword.trim()}%`)
    .eq('uid', user.id)
    .not('text', 'is', null)

  if (error) {
    console.error('Error searching dev logs:', error)
    throw error
  }

  return result?.map((item: any) => {
    return {
      ...item,
      group: item.dev_log_group ?? null
    }
  }) || []
}
