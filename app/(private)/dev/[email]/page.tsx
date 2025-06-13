'use server'

import { getUser } from '@/actions/session/getUser'
import DevLogView from '@/components/dev/DevLogView'
import BoardType from '@/types/dev/BoardType'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  const boardList: BoardType | null = await getGroupTreeAndPostsByPk()

  const test = await getAllGroupTree()

  if (!boardList) return
  return (
    <>
      <DevLogView list={boardList} test={test} />
    </>
  )
}
