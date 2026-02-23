'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

export default async function deleteDevLog(pk: number) {
  const [deleted] = await db.delete(devLog).where(eq(devLog.pk, pk)).returning()
  revalidateTag('dev-log')
  if (!deleted?.groupPk) return
  return deleted
}
