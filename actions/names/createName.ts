'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'
import { nameType } from '@/types/schemaType'

export default async function createName(nameData: nameType) {
  const user = await getUser()
  if (!user) return

  const { name: nameValue, subname, description, secretDescription, importanceLevel, images } = nameData

  const { data, error } = await db
    .from('name')
    .insert({
      name: nameValue,
      subname,
      description,
      secret_description: secretDescription,
      importance_level: importanceLevel,
      images,
      uid: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating name:', error)
    throw error
  }

  return data
}
