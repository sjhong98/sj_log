'use server'

import { financeLog } from '@/supabase/schema'
import { getUser } from '@/actions/session/getUser'
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'
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

  let conditions: any = [
    eq(financeLog.uid, user.id),
    gte(financeLog.date, startDate),
    lte(financeLog.date, endDate)
  ]

  if (options) {
    if (options.filter !== undefined)
      conditions.push(
        eq(financeLog.category, financeCategories[options.filter].title)
      )
  }

  let logs: any = await db
    .select()
    .from(financeLog)
    .where(and(...conditions))
    .orderBy(desc(financeLog.date))

  for (let i = logs.length - 1; i >= 0; i--) {
    if (i === logs.length - 1) {
      logs[i].isNewDay = true
    } else {
      if (
        dayjs(logs[i + 1].date).get('date') !== dayjs(logs[i].date).get('date')
      )
        logs[i].isNewDay = true
      else logs[i].isNewDay = false
    }
  }

  return logs
}
