import db from "@/supabase"
import { user } from "@/supabase/schema"
import { eq } from "drizzle-orm"

const getUserByEmail = async (id: string) => {
  const userInfo = await db.select().from(user).where(eq(user.id, id)).limit(1)
  return userInfo?.[0] ?? null
}

export default getUserByEmail