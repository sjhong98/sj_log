'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { nameType } from '@/types/schemaType'

export default async function createName(nameData: nameType) {
  const user = await getUser()
  if (!user) return

  const { name: nameValue, subname, description, secretDescription, importanceLevel, images } = nameData

  const [result] = await db.insert(name).values({
    name: nameValue,
    subname,
    description,
    secretDescription,
    importanceLevel,
    images,
    uid: user.id
  }).returning()

  return result
}
