'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import { useCallback, useEffect, useState } from 'react'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import BoardType from '@/types/dev/BoardType'

export default function DevLogView({ list }: { list: BoardType }) {
  const [groupPostList, setGroupPostList] = useState<BoardType | null>(list)
  const [boardList, setBoardList] = useState<(devLogGroupType | devLogType)[]>(
    []
  )

  const handleClickDevLog = useCallback(async (item: devLogType) => {
    const currentBoard: BoardType | null = await getGroupTreeAndPostsByPk(
      item.groupPk
    )
    if (!currentBoard) return
    setGroupPostList(currentBoard)
  }, [])

  const handleClickDevLogGroup = useCallback(async (item: devLogGroupType) => {
    const currentBoard: BoardType | null = await getGroupTreeAndPostsByPk(
      item.pk
    )
    if (!currentBoard) return
    setGroupPostList(currentBoard)
  }, [])

  useEffect(() => {
    if (!groupPostList) return
    setBoardList([...groupPostList.lowerGroupList, ...groupPostList.posts])
  }, [groupPostList])

  return (
    <Row fullWidth gap={4} className={'flex-wrap'}>
      {/*  List  */}
      <Column fullWidth gap={2}>
        {boardList.map((item: devLogGroupType | devLogType, i: number) => {
          const isPost = 'content' in item
          const title = isPost ? item.title : item.name
          return (
            <Row
              key={i}
              onClick={() => {
                isPost ? handleClickDevLog(item) : handleClickDevLogGroup(item)
              }}
            >
              {title}
            </Row>
          )
        })}
      </Column>
    </Row>
  )
}
