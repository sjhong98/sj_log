'use server'

import { getUser } from '@/actions/session/getUser'
import dayjs from 'dayjs'
import db from '@/supabase'
import financeCategories from '@/types/finance/FinanceCategories'

interface OptionProps {
  filter?: number
}

export default async function getMonthlyLogs(
  year: number,
  month: number,
  options?: OptionProps
) {
  const user = await getUser()
  if (!user) return

  const startDate = dayjs()
    .set('year', year)
    .set('month', month - 1)
    .startOf('month')
    .toDate()
    .toISOString()
  const endDate = dayjs()
    .set('year', year)
    .set('month', month - 1)
    .add(1, 'month')
    .startOf('month')
    .toDate()
    .toISOString()

  let query = db
    .from('finance_log')
    .select('*')
    .eq('uid', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (options?.filter !== undefined) {
    query = query.eq('category', financeCategories[options.filter].title)
  }

  const { data: logs, error } = await query.order('date', { ascending: false })

  if (error) {
    console.error('Error fetching monthly logs:', error)
    throw error
  }

  // Add isNewDay property
  const logsWithNewDay = (logs || []).map((log: any, i: number) => {
    if (i === (logs || []).length - 1) {
      return { ...log, isNewDay: true }
    } else {
      const isNewDay = dayjs(logs[i + 1].date).get('date') !== dayjs(log.date).get('date')
      return { ...log, isNewDay }
    }
  })

  return logsWithNewDay
}
