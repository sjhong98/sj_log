'use server'

import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import { getUser } from '@/actions/session/getUser'
import DevLogView from '@/components/dev/DevLogView'
import BoardType from '@/types/dev/BoardType'

export default async function Page() {
  let user: any = await getUser()
  // if (!user) return

  const boardList: BoardType | null = await getGroupTreeAndPostsByPk()
  const groupTree = await getAllGroupTree()

  console.log('\n\n\nboardList', boardList)
  console.log('\n\n\ngroupTree', groupTree)

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
