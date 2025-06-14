'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { and, eq } from 'drizzle-orm'
import { PgTableWithColumns } from 'drizzle-orm/pg-core'
import { devLog } from '@/supabase/schema'

export default async function Delete(
  table: PgTableWithColumns<any>,
  pk: number,
  options: {
    conditions?: any[]
  }
) {
  const user = await getUser()
  if (!user) return

  let { conditions = [] } = options

  conditions.push(eq(devLog.pk, pk))

  return db
    .delete(table)
    .where(and(...conditions))
    .returning()
}
