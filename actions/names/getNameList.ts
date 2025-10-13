'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function getNameList({ filter }: { filter?: string }) {
  try {
    const user = await getUser()
    if (!user) return

    const { data: nameList, error: nameListError } = await db
      .from('name')
      .select('*')
      .eq('uid', user.id)
      .order('created_at', { ascending: false })

    if (nameListError) {
      console.error('Error fetching name list:', nameListError)
      throw nameListError
    }

    const { count: total, error: countError } = await db
      .from('name')
      .select('*', { count: 'exact', head: true })
      .eq('uid', user.id)

    if (countError) {
      console.error('Error counting names:', countError)
      throw countError
    }

    return {
      nameList: nameList || [],
      total: total || 0
    }
  } catch (error) {
    throw error
  }
}
