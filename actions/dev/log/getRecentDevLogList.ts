'use server'

import getUserByEmail from '@/actions/user/getUserByEmail'

export default async function getRecentDevLogList(userId: string) {
  const params = new URLSearchParams()
  params.set('uid', `eq.${(await getUserByEmail(userId))?.uid}`)
  params.set('is_private', 'eq.false')
  params.set('limit', '20')
  params.set('order', 'updated_at.desc')
  params.set('select', '*,name:dev_log_group(name)')

  const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log?${params.toString()}`, {
    headers: {
      apikey: process.env.SUPABASE_KEY ?? '',
      Authorization: `Bearer ${process.env.SUPABASE_KEY ?? ''}`,
    },
    cache: 'force-cache',
    next: {
      tags: ['dev-log'],
    },
  })

  const pinnedDevLogList = await result.json()
  return pinnedDevLogList
}
