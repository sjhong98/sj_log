'use server'

import db from '@/supabase'
import { name } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, eq } from 'drizzle-orm'

interface UpdateNameData {
  pk: number
  name: string
  subname?: string
  description?: string
  secretDescription?: string
  importanceLevel?: number
  images?: string
}

export default async function updateName(nameData: UpdateNameData) {
  const { pk, name: nameValue, subname, description, secretDescription, importanceLevel, images } = nameData

  if (!pk) return

  const user = await getUser()
  if (!user) return

  const result = await db
    .update(name)
    .set({
      name: nameValue,
      subname,
      description,
      secretDescription,
      importanceLevel,
      images,
      uid: user.id
    })
    .where(and(eq(name.uid, user.id), eq(name.pk, pk)))

  return result.rowCount
}
