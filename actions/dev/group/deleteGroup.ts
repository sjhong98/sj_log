'use server'

import db from '@/supabase'
import { devLogGroup } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'

export default async function deleteGroup(pk: number) {
  try {
    const [deletedGroup] = await db
      .delete(devLogGroup)
      .where(eq(devLogGroup.pk, pk))
      .returning()
    if (!deletedGroup.parentGroupPk) return
    const updatedGroupTree = await getAllGroupTree()
    return updatedGroupTree?.groupTree
  } catch (e) {
    console.error(e)
  }
}
