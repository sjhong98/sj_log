'use server'

import { getUser } from '@/actions/session/getUser'
import { devLog } from '@/supabase/schema'
import { postgrestQuery } from '@/utils/postgrestQuery'
import snakeToCamel from '@/utils/snakeToCamel'
import { eq } from 'drizzle-orm'

export default async function getDevLogByPk(pk: number) {
  const user = await getUser()

  let whereLogConditions: any[] = [eq(devLog.pk, pk)]

  if (!user) whereLogConditions.push(eq(devLog.isPrivate, false))

  const params = new URLSearchParams()
  params.set('pk', `eq.${pk}`)
  if (!user) params.set('is_private', 'eq.false')
  params.set('limit', '1')

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

  let devLogData = await result.json()
  devLogData = snakeToCamel(devLogData)

  if (!Array.isArray(devLogData) || devLogData.length === 0) {
    throw new Error('Dev log data is not found')
  }

  devLogData = devLogData[0]
  devLogData.group = []

  let parentGroupPk = devLogData.groupPk

  while (true) {
    // let whereConditions: any[] = [eq(devLogGroup.pk, parentGroupPk)];
    // if(!user) whereConditions.push(eq(devLogGroup.isPrivate, false));

    const params = new URLSearchParams()

    postgrestQuery().select('*').eq('pk', parentGroupPk).limit(1).eq('is_private', false)

    params.set('pk', `eq.${parentGroupPk}`)
    params.set('limit', '1')
    if (!user) params.set('is_private', 'eq.false')

    const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log_group?${params.toString()}`, {
      headers: {
        apikey: process.env.SUPABASE_KEY ?? '',
        Authorization: `Bearer ${process.env.SUPABASE_KEY ?? ''}`,
      },
      cache: 'force-cache',
      next: {
        tags: ['dev-log-group'],
      },
    })

    let parentGroupList = await result.json()
    parentGroupList = snakeToCamel(parentGroupList[0] ?? {})

    devLogData.group.unshift(parentGroupList)
    parentGroupPk = parentGroupList.parentGroupPk

    if (!parentGroupList.parentGroupPk) break
  }

  console.log('devLogData', devLogData)

  return devLogData || null
}
