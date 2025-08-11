'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { unstable_noStore } from 'next/cache'

export default async function getDevLogByPk(pk: number) {
  unstable_noStore()

  const devLogData = await db
    .select()
    .from(devLog)
    .where(eq(devLog.pk, pk))
    .limit(1)
  
  return devLogData[0] || null
} 