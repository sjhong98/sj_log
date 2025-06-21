'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

export default async function deleteDevLog(pk: number) {
  const [deleted] = await db.delete(devLog).where(eq(devLog.pk, pk)).returning()
  if (!deleted?.groupPk) return
  return deleted
}
