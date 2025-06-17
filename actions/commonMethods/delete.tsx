'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { and, eq } from 'drizzle-orm'
import { devLog, devLogGroup } from '@/supabase/schema'

export default async function Delete(
  table: string,
  pk: number,
  options?: {
    conditions?: any[]
  }
) {
  try {
    const user = await getUser()
    if (!user) return

    let conditions: any = []

    const _table: any =
      table === 'devLog' ? devLog : table === 'devLogGroup' ? devLogGroup : null
    if (!_table) return

    if (options?.conditions) conditions = [...options.conditions]
    conditions.push(eq(_table.pk, pk))
    const result = await db.delete(_table).where(and(...conditions))
    return result.rowCount
  } catch (error) {
    console.error(error)
    throw new Error('Error occurred while deleting dev log')
  }
}
