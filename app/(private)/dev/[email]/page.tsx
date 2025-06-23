'use server'

import { getUser } from '@/actions/session/getUser'
import DevLogView from '@/components/dev/DevLogView'
import BoardType from '@/types/dev/BoardType'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'
import GroupTreeType from '@/types/dev/GroupTreeType'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  const boardList: BoardType | null = await getGroupTreeAndPostsByPk()

  const groupTree = await getAllGroupTree()

  if (!boardList || !groupTree) return
  return (
    <>
      <DevLogView
        list={boardList}
        groupTree={groupTree.groupTree}
        groupList={groupTree.groupList}
      />
    </>
  )
}
