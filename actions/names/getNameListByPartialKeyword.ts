'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function getNameListByPartialKeyword(keyword: string) {
  const user = await getUser()
  if (!user) return

  const searchPattern = `%${keyword}%`

  const { data: nameList, error: nameListError } = await db
    .from('name')
    .select('*')
    .eq('uid', user.id)
    .or(`name.ilike.${searchPattern},subname.ilike.${searchPattern}`)
    .order('created_at', { ascending: false })

  if (nameListError) {
    console.error('Error fetching name list by keyword:', nameListError)
    throw nameListError
  }

  const { count: total, error: countError } = await db
    .from('name')
    .select('*', { count: 'exact', head: true })
    .eq('uid', user.id)
    .or(`name.ilike.${searchPattern},subname.ilike.${searchPattern}`)

  if (countError) {
    console.error('Error counting names by keyword:', countError)
    throw countError
  }

  return {
    nameList: nameList || [],
    total: total || 0
  }
}
