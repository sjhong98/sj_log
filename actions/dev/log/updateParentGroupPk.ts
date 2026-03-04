'use server'

import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import getDevLogAddress from './getDevLogAddress'

export default async function updateParentGroupPk(pk: number, newGroupPk: number) {
  const addressArray = await getDevLogAddress(newGroupPk)
  const address = addressArray.join(' > ')
  const [updated] = await db
    .update(devLog)
    .set({
      groupPk: newGroupPk,
      address,
    })
    .where(eq(devLog.pk, pk))
    .returning()

  revalidateTag('dev-log')
  if (!updated) return
  return updated
}
