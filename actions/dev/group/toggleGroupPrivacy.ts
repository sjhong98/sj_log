'use server'

import { getUser } from "@/actions/session/getUser"
import db from "@/supabase"
import { devLogGroup } from "@/supabase/schema"
import { eq } from "drizzle-orm"

export default async function toggleGroupPrivacy(pk: number, isPrivate: boolean) {
    const user = await getUser()
    if (!user) return

    const [newGroup] = await db
      .update(devLogGroup)
      .set({ isPrivate })
      .where(eq(devLogGroup.pk, pk))
      .returning()
    
    return newGroup
}