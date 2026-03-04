import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'

export default async function getDevLogAddress(groupPk: number): Promise<string[]> {
  let addressArray: string[] = []

  let [parentGroup] = await db.select().from(devLogGroup).where(eq(devLogGroup.pk, groupPk)).limit(1)

  while (true) {
    if (!parentGroup || !parentGroup.parentGroupPk || parentGroup.name === 'Root') break
    addressArray.unshift(parentGroup.name)
    ;[parentGroup] = await db.select().from(devLogGroup).where(eq(devLogGroup.pk, parentGroup.parentGroupPk)).limit(1)
  }

  return addressArray
}
