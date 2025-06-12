'use server'

import { getUser } from '@/actions/session/getUser'
import DevLogView from '@/components/dev/DevLogView'
import { devLogType } from '@/types/schemaType'
import getTopGroupAndPosts from '@/actions/dev/group/getTopGroupAndPosts'
import BoardType from '@/types/dev/BoardType'

export default async function Page() {
  let user: any = await getUser()
  if (!user) return

  const boardList: BoardType | undefined = await getTopGroupAndPosts()

  if (!boardList) return
  return (
    <>
      <DevLogView list={boardList} />
    </>
  )
}
