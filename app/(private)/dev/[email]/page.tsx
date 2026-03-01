'use server'

import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import getPostListByGroupPk, { simpleDevLogType } from '@/actions/dev/group/getPostListByGroupPk'
import getDevLogByPk from '@/actions/dev/log/getDevLogByPk'
import getPinnedDevLogList from '@/actions/dev/log/getPinnedDevLogList'
import DevLogView from '@/components/dev/DevLogView'
import BoardType from '@/types/dev/BoardType'
import { devLogType } from '@/types/schemaType'

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ email: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { email } = await params
  const { devLogPk, devLogGroupPk } = await searchParams

  const decodedEmail = decodeURIComponent(email)

  const boardList: BoardType | null = await getGroupTreeAndPostsByPk()
  const groupTree = await getAllGroupTree(decodedEmail)

  // url query string 로부터 devLogGroupPk / devLogPk 조회하여 패치
  let devLogList: simpleDevLogType[] = []
  let devLog: devLogType | null = null
  let pinnedDevLogList: devLogType[] = []

  if (devLogGroupPk) {
    devLogList = await getPostListByGroupPk(Number(devLogGroupPk))
  }

  if (devLogPk) {
    devLog = devLogPk ? await getDevLogByPk(Number(devLogPk)) : null
  }

  if (!devLogPk && decodedEmail) {
    pinnedDevLogList = await getPinnedDevLogList(decodedEmail)
    console.log('pinnedDevLogList: ', pinnedDevLogList)
  }

  if (!boardList || !groupTree) return
  return (
    <>
      <DevLogView
        list={boardList}
        groupTreeProp={groupTree.groupTree}
        groupListProp={groupTree.groupList}
        currentPostListProp={devLogList}
        selectedDevLogProp={devLog}
        pinnedDevLogListProp={pinnedDevLogList}
      />
    </>
  )
}
