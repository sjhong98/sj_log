'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

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

  const { error } = await db
    .from('name')
    .update({
      name: nameValue,
      subname,
      description,
      secret_description: secretDescription,
      importance_level: importanceLevel,
      images,
      uid: user.id
    })
    .eq('uid', user.id)
    .eq('pk', pk)

  if (error) {
    console.error('Error updating name:', error)
    throw error
  }

  return 1 // supabase-js doesn't return rowCount, so we assume success
}
