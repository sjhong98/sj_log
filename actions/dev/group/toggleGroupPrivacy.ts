'use server'

import { getUser } from "@/actions/session/getUser"
import db from "@/supabase"
import { devLog, devLogGroup } from "@/supabase/schema"
import { devLogGroupType, devLogType } from "@/types/schemaType"
import { eq, inArray } from "drizzle-orm"

export default async function toggleGroupPrivacy(pk: number, isPrivate: boolean) {
  try {
    const user = await getUser()
    if (!user) return

    const [newGroup] = await db
      .update(devLogGroup)
      .set({ isPrivate })
      .where(eq(devLogGroup.pk, pk))
      .returning()

    let devLogGroupListToTogglePrivacy: devLogGroupType[] = []
    let devLogListToTogglePrivacy: devLogType[] = []
    let devLogGroupListToTogglePrivacyStack: (devLogGroupType | { pk: number })[] = [{ pk }]

    // 자식 devLogGroup, devLog 전체 조회
    while (true) {
      if (devLogGroupListToTogglePrivacyStack.length === 0) break;
      const currentGroupPk = devLogGroupListToTogglePrivacyStack.pop()?.pk

      if (!currentGroupPk) throw new Error('Current group pk not found');

      const devLogGroupList = await db
        .select()
        .from(devLogGroup)
        .where(eq(devLogGroup.parentGroupPk, currentGroupPk))

      const devLogList = await db
        .select()
        .from(devLog)
        .where(eq(devLog.groupPk, currentGroupPk))

      devLogListToTogglePrivacy = [...devLogListToTogglePrivacy, ...devLogList]
      devLogGroupListToTogglePrivacy = [...devLogGroupListToTogglePrivacy, ...devLogGroupList]
      devLogGroupListToTogglePrivacyStack = [...devLogGroupList, ...devLogGroupListToTogglePrivacyStack]
    }

    await db
      .update(devLogGroup)
      .set({ isPrivate })
      .where(inArray(devLogGroup.pk, devLogGroupListToTogglePrivacy.map(item => item.pk ?? -1)))

    await db
      .update(devLog)
      .set({ isPrivate })
      .where(inArray(devLog.pk, devLogListToTogglePrivacy.map(item => item.pk ?? -1)))

    return newGroup
  } catch (error) {
    console.error('Failed to toggle group privacy:', error)
    throw new Error('Failed to toggle group privacy')
  }
}