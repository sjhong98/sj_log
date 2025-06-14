'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import BoardType from '@/types/dev/BoardType'
import { Folder, Tree } from '@/components/magicui/file-tree'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { FileIcon } from 'lucide-react'
import DevLogDetailView from '@/components/dev/DevLogDetailView'

export default function DevLogView({
  list,
  groupTree
}: {
  list: BoardType
  groupTree: GroupTreeType[]
}) {
  const [board, setBoard] = useState<BoardType | null>(list)
  const [selectedDevLog, setSelectedDevLog] = useState<devLogType | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<devLogGroupType | null>(
    null
  )

  const handleClickDevLog = useCallback(async (item?: devLogType) => {
    if (!item) return
    setSelectedDevLog(item)
  }, [])

  const handleClickDevLogGroup = useCallback(async (item: devLogGroupType) => {
    const currentBoard: BoardType | null = await getGroupTreeAndPostsByPk(
      item.pk
    )
    if (!currentBoard) return
    setBoard(currentBoard)
  }, [])

  const returnFolder = useCallback(
    (group: GroupTreeType) => {
      // Leaf Groups
      if (group?.childGroupList?.length === 0) {
        if (!group) return
        return (
          <Folder
            key={group.pk}
            value={group.name}
            element={group.name}
            onClick={e => {
              e.stopPropagation()
              handleClickDevLogGroup(group)
              setSelectedGroup(group)
            }}
            isSelectable
            isSelect={selectedGroup?.pk === group.pk}
          />
        )
      }

      return (
        <Folder
          key={group.pk}
          element={group?.name ?? ''}
          value={group?.name ?? ''}
          onClick={e => {
            e.stopPropagation()
            handleClickDevLogGroup(group)
            setSelectedGroup(group)
            console.log(selectedGroup)
          }}
          isSelectable
          isSelect={selectedGroup?.pk === group.pk}
        >
          {group?.childGroupList?.map(child => returnFolder(child))}
        </Folder>
      )
    },
    [groupTree, selectedGroup]
  )

  const GroupTreeComponent = useMemo(() => {
    return groupTree.map(child => returnFolder(child))
  }, [groupTree, selectedGroup])

  return (
    <Row fullWidth gap={4} className={'min-w-[200px]'}>
      {/*  Navigation Area  */}
      <Column gap={4} fullWidth className={'flex-[1]'}>
        <Tree className={'text-[#ddd]'}>{GroupTreeComponent}</Tree>

        <Column fullWidth gap={4} className={''}>
          {/*  File List  */}
          <Column fullWidth>
            {board?.posts.map((item: devLogType, i: number) => {
              const isPost = 'content' in item
              if (!isPost) return
              return (
                <Row
                  key={i}
                  gap={1}
                  fullWidth
                  className={
                    'items-center cursor-pointer rounded-sm py-1 px-2 hover:bg-stone-800'
                  }
                  onClick={() => handleClickDevLog(item)}
                >
                  <FileIcon className='size-4 mt-[1px]' />
                  {item.title}
                </Row>
              )
            })}
          </Column>
        </Column>
      </Column>

      {/*  File View Area  */}
      <Column gap={4} fullWidth className={'flex-[3]'}>
        <DevLogDetailView
          selectedDevLog={selectedDevLog}
          selectedGroup={selectedGroup}
          currentBoard={board}
        />
      </Column>
    </Row>
  )
}

// {board?.currentGroup && (
//   <p
//     onClick={async () => {
//       // 현재 최상단 그룹을 가리키고 있는 경우
//       if (!board?.upperGroupList) {
//         await handleClickDevLog()
//       }
//       // 부모가 있는 경우
//       else {
//         const parentGroup =
//           board?.upperGroupList?.[board?.upperGroupList.length - 1]
//         if (parentGroup) await handleClickDevLogGroup(parentGroup)
//       }
//     }}
//   >
//     back
//   </p>
// )}
