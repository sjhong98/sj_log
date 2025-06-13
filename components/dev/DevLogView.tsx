'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import { useCallback, useEffect, useState } from 'react'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import BoardType from '@/types/dev/BoardType'

export default function DevLogView({
  list,
  test
}: {
  list: BoardType
  test: any
}) {
  const [board, setBoard] = useState<BoardType | null>(list)
  const [boardList, setBoardList] = useState<(devLogGroupType | devLogType)[]>(
    []
  )

  console.log('test : ', test)

  const handleClickDevLog = useCallback(async (item?: devLogType) => {
    const currentBoard: BoardType | null = await getGroupTreeAndPostsByPk(
      item ? item.groupPk : undefined
    )
    if (!currentBoard) return
    setBoard(currentBoard)
  }, [])

  const handleClickDevLogGroup = useCallback(async (item: devLogGroupType) => {
    const currentBoard: BoardType | null = await getGroupTreeAndPostsByPk(
      item.pk
    )
    if (!currentBoard) return
    setBoard(currentBoard)
  }, [])

  useEffect(() => {
    if (!board) return
    setBoardList([...board.lowerGroupList, ...board.posts])
  }, [board])

  return (
    <Row fullWidth gap={4}>
      <Column fullWidth gap={4} className={''}>
        {board?.currentGroup && (
          <p
            onClick={async () => {
              // 현재 최상단 그룹을 가리키고 있는 경우
              if (!board?.upperGroupList) {
                await handleClickDevLog()
              }
              // 부모가 있는 경우
              else {
                const parentGroup =
                  board?.upperGroupList?.[board?.upperGroupList.length - 1]
                if (parentGroup) await handleClickDevLogGroup(parentGroup)
              }
            }}
          >
            back
          </p>
        )}

        {board?.currentGroup && (
          <p>
            {`${
              board?.upperGroupList
                ? board?.upperGroupList
                    ?.map((item: devLogGroupType) => item.name)
                    .join(' > ') + ' > '
                : ''
            }${board.currentGroup.name}`}
          </p>
        )}

        {/*  List  */}
        <Column fullWidth gap={2}>
          {boardList.map((item: devLogGroupType | devLogType, i: number) => {
            const isPost = 'content' in item
            const title = isPost ? item.title : item.name
            return (
              <Row
                key={i}
                onClick={() => {
                  isPost
                    ? handleClickDevLog(item)
                    : handleClickDevLogGroup(item)
                }}
              >
                {title}
              </Row>
            )
          })}
        </Column>
      </Column>
    </Row>
  )
}
