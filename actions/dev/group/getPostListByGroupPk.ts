'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import snakeToCamel from '@/utils/snakeToCamel'
import { and, desc, eq } from 'drizzle-orm'

export interface simpleDevLogType {
  pk: number
  title: string
}

export default async function getPostListByGroupPk(groupPk: number) {
  const user = await getUser()

  let whereConditions: any[] = [eq(devLog.groupPk, groupPk)];
  if(!user) whereConditions.push(eq(devLog.isPrivate, false));

  const params = new URLSearchParams()
  params.set('group_pk', `eq.${groupPk}`)
  if(!user) params.set('is_private', 'false')
  params.set('limit', '100')
  params.set('order', 'created_at.desc')

  const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log?${params.toString()}`, {
    headers: {
      'apikey': process.env.SUPABASE_KEY ?? '',
      'Authorization': `Bearer ${process.env.SUPABASE_KEY ?? ''}`
    },
    cache: 'force-cache',
    next: {
      tags: ['dev-log']
    }
  })
  let postList = await result.json()
  postList = snakeToCamel(postList)
    
  return postList
}
