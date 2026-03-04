import db from '@/supabase'
import { devLog } from '@/supabase/schema'
import { eq } from 'drizzle-orm'
import getDevLogAddress from './getDevLogAddress'

export default async function updateAllDevLogAddress() {
  const devLogList = await db.select().from(devLog)

  for (let devLogItem of devLogList) {
    const addressArray = devLogItem.groupPk ? await getDevLogAddress(devLogItem.groupPk) : []
    const address = addressArray.join(' > ')
    await db.update(devLog).set({ address }).where(eq(devLog.pk, devLogItem.pk))
  }

  process.exit(0)
}

updateAllDevLogAddress()
