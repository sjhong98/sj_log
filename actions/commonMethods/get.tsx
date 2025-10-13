'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'
import { and, eq } from 'drizzle-orm'
import { PgTableWithColumns } from 'drizzle-orm/pg-core'

export default async function Get(table: PgTableWithColumns<any>) {
  const user = await getUser()
  if (!user) return

  const list: any = async (conditions?: any[]) => {
    const _conditions = conditions ? [...conditions] : []
    return db
      .select()
      .from(table)
      .where(and(..._conditions))
  }

  const detail = async ({ pk }: { pk?: number }) => {
    let conditions: any = [{ uid: user.id }]

    if (pk) conditions.push({ pk })

    return db
      .select()
      .from(table)
      .where(and(...conditions))
  }

  return { detail, list }
}
