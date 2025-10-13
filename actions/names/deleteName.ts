'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { eq } from 'drizzle-orm'

export default async function deleteName(pk: number) {
  const user = await getUser()
  if (!user || !pk) return

  const result = await db.delete(name).where(eq(name.pk, pk))
  return result.rowCount
}
