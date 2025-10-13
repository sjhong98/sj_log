'use server'

import { getUser } from '@/actions/session/getUser'
import db from '@/supabase'

export default async function getLogsByAccountPk(accountPk: number) {
  const user = await getUser()
  if (!user) return

  const { data: logs, error } = await db
    .from('finance_log')
    .select('*')
    .eq('finance_account_pk', accountPk)
    .eq('uid', user.id)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching logs by account pk:', error)
    throw error
  }

  return logs || []
} 