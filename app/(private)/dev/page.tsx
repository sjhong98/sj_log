'use server'

import getGlobalRecentDevLogList from "@/actions/dev/log/getGlobalRecentDevLogList"
import DevLogDashboard from "@/components/dev/DevLogDashboard"

const Page = async () => {
  const devLogList = await getGlobalRecentDevLogList()

  return <DevLogDashboard devLogList={devLogList} />
}

export default Page
