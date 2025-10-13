'use server'

import db from '@/supabase'
import { getUser } from '@/actions/session/getUser'

export default async function getAccounts() {
  const user = await getUser()
  if (!user) return

  const { data, error } = await db
    .from('finance_account')
    .select('*')
    .eq('uid', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching accounts:', error)
    throw error
  }

  return data || []
}
