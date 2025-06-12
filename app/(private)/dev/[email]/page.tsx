import { getUser } from '@/actions/session/getUser'
import Get from '@/actions/commonMethods/get'
import { devLog } from '@/supabase/schema'
import DevLogList from '@/components/dev/DevLogList'
import { devLogType } from '@/types/schemaType'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  const devLogList: devLogType[] = await (await Get(devLog))?.list()

  return (
    <>
      <DevLogList devLogList={devLogList} />
    </>
  )
}
