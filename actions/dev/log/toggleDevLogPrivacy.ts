'use server'

import { getUser } from "@/actions/session/getUser"
import db from "@/supabase"
import { devLog } from "@/supabase/schema"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"

export default async function toggleDevLogPrivacy(pk: number, isPrivate: boolean) {
    const user = await getUser()
    if (!user) return

    revalidateTag('dev-log')
    const [newDevLog] = await db.update(devLog).set({ isPrivate }).where(eq(devLog.pk, pk)).returning()
    return newDevLog
}