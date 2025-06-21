'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import React, { useCallback, useMemo, useState } from 'react'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import Delete from '@/actions/commonMethods/delete'
import BoardType from '@/types/dev/BoardType'
import { Folder, Tree } from '@/components/magicui/file-tree'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { FileIcon, FolderInputIcon, PlusIcon } from 'lucide-react'
import DevLogDetailView from '@/components/dev/DevLogDetailView'
import { devLog } from '@/supabase/schema'
import { toast } from 'react-toastify'
import createGroup from '@/actions/dev/group/createGroup'
import { Dialog } from '@mui/material'
import getAllGroupTree from '@/actions/dev/group/getAllGroupTree'
import CustomPopper from '@/components/popper/CustomPopper'
import { IconTrashFilled } from '@tabler/icons-react'
import updateParentGroupPk from '@/actions/dev/log/updateParentGroupPk'

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
  const [temporarySelectedGroup, setTemporarySelectedGroup] =
    useState<devLogGroupType | null>(null)
  const [currentGroupTree, setCurrentGroupTree] =
    useState<GroupTreeType[]>(groupTree)
  const [groupCreateModalOpen, setGroupCreateModalOpen] = useState(false)
  const [changeGroupModalOpen, setChangeGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState<string>('')

  const handleClickDevLog = useCallback(async (item?: devLogType) => {
    if (!item) return
    setSelectedDevLog(item)
  }, [])

  const handleClickDevLogGroup = useCallback(async (groupPk?: number) => {
    if (!groupPk) return

    const currentBoard: BoardType | null =
      // TODO: post 만 가져오도록 변경
      await getGroupTreeAndPostsByPk(groupPk)
    if (!currentBoard) return
    setBoard(currentBoard)
  }, [])

  // Recursive Tree for Navigator
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
              handleClickDevLogGroup(group.pk)
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
            handleClickDevLogGroup(group.pk)
            setSelectedGroup(group)
          }}
          isSelectable
          isSelect={selectedGroup?.pk === group.pk}
        >
          {group?.childGroupList?.map(child => returnFolder(child))}
        </Folder>
      )
    },
    [currentGroupTree, selectedGroup]
  )

  const GroupTreeComponent = useMemo(() => {
    return currentGroupTree.map(child => returnFolder(child))
  }, [currentGroupTree, selectedGroup])

  // Recursive Tree for Select Group
  const returnIndependentFolder = useCallback(
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
              if (!group?.pk) return

              if (temporarySelectedGroup?.pk !== group.pk)
                setTemporarySelectedGroup(group)
              else updateDevLogParentGroup()
            }}
            isSelectable
            isSelect={temporarySelectedGroup?.pk === group.pk}
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
            if (!group?.pk) return

            if (temporarySelectedGroup?.pk !== group.pk)
              setTemporarySelectedGroup(group)
            else updateDevLogParentGroup()
          }}
          isSelectable
          isSelect={temporarySelectedGroup?.pk === group.pk}
        >
          {group?.childGroupList?.map(child => returnIndependentFolder(child))}
        </Folder>
      )
    },
    [currentGroupTree, temporarySelectedGroup]
  )

  const IndependentGroupTreeComponent = useMemo(() => {
    return currentGroupTree.map(child => returnIndependentFolder(child))
  }, [currentGroupTree, temporarySelectedGroup])

  const updateFileTree = useCallback(
    async (groupPk: number) => {
      await handleClickDevLogGroup(groupPk)
    },
    [handleClickDevLogGroup]
  )

  const handleCreateGroup = useCallback(async () => {
    if (!selectedGroup) return
    try {
      const result = await createGroup({
        parentGroupPk: selectedGroup.pk ?? 0,
        name: newGroupName
      })
      if (!result) return
      toast.success('Created new group successfully!')
      const newGroupTree = await getAllGroupTree()
      if (newGroupTree) setCurrentGroupTree(newGroupTree)
    } catch (e) {
      console.error(e)
      toast.error('Failed to create new group.')
    } finally {
      setNewGroupName('')
    }
  }, [selectedGroup, newGroupName])

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return

    if (
      (board?.posts?.length && board?.posts?.length > 0) ||
      (board?.lowerGroupList?.length && board?.lowerGroupList?.length > 0)
    ) {
      toast.error('Cannot delete group with files or child groups')
      return
    }

    try {
      const rowCount = await Delete('devLogGroup', selectedGroup?.pk ?? 0)
      if (rowCount) {
        toast.success('Deleted group successfully!')
        const newGroupTree = await getAllGroupTree()
        if (newGroupTree) setCurrentGroupTree(newGroupTree)
      } else {
        toast.error('Failed to delete group.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete group.')
    }
  }, [selectedGroup, board])

  const deleteDevLog = useCallback(
    async (devLog: devLogType) => {
      if (!devLog.pk) return

      try {
        const rowCount = await Delete('devLog', devLog.pk)
        if (rowCount) {
          toast.success('Deleted successfully!')
          await updateFileTree(devLog.groupPk)
        } else toast.error('Failed to delete group')
      } catch (e) {
        console.error(e)
        toast.error('Failed to delete group')
      }
    },
    [updateFileTree]
  )

  const updateDevLogParentGroup = useCallback(async () => {
    if (
      !temporarySelectedGroup?.pk ||
      !selectedDevLog?.pk ||
      !selectedGroup?.pk
    )
      return

    const rowCount = await updateParentGroupPk(
      selectedDevLog.pk,
      temporarySelectedGroup.pk
    )
    if (rowCount) {
      setChangeGroupModalOpen(false)
      await updateFileTree(selectedGroup.pk)
      setTemporarySelectedGroup(null)
      toast.success('Dev log moved successfully!')
    } else {
      toast.error('Failed to moved parent group')
    }
  }, [temporarySelectedGroup, selectedDevLog, updateFileTree, selectedGroup])

  return (
    <>
      <Row fullWidth gap={4} className={'min-w-[200px]'}>
        {/*  Navigation Area  */}
        <Column gap={4} fullWidth className={'flex-[1]'}>
          <Row className={'relative group'}>
            <Tree className={'text-[#ddd] !h-fit'}>{GroupTreeComponent}</Tree>
            {selectedGroup && (
              <Row
                className={
                  'absolute right-0 top-0 opacity-0 group-hover:opacity-100'
                }
              >
                <PlusIcon
                  className={'cursor-pointer'}
                  onClick={() => setGroupCreateModalOpen(true)}
                />
                <PlusIcon
                  className={'cursor-pointer rotate-[45deg]'}
                  onClick={handleDeleteGroup}
                />
              </Row>
            )}
          </Row>

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
                      'items-center justify-between cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group'
                    }
                    onClick={() => handleClickDevLog(item)}
                  >
                    <Row gap={1} className={'items-center'}>
                      <FileIcon className='size-4 mt-[1px]' />
                      {item.title}
                    </Row>
                    <Row
                      className={
                        'group-hover:opacity-100 opacity-0 scale-[0.8] hover:scale-[1]'
                      }
                    >
                      <CustomPopper
                        buttons={[
                          {
                            icon: <IconTrashFilled />,
                            function: () => deleteDevLog(item)
                          },
                          {
                            icon: <FolderInputIcon />,
                            function: () => setChangeGroupModalOpen(true)
                          }
                        ]}
                      />
                    </Row>
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
            setSelectedDevLog={setSelectedDevLog}
            selectedGroup={selectedGroup}
            selectedBoard={board}
            updateFileTree={updateFileTree}
          />
        </Column>
      </Row>

      {/*  Create New Group Modal  */}
      <Dialog
        open={groupCreateModalOpen}
        onClose={() => setGroupCreateModalOpen(false)}
      >
        <form
          onSubmit={e => {
            e.preventDefault()
            if (newGroupName === '') return
            handleCreateGroup()
            setGroupCreateModalOpen(false)
          }}
          className={'flex p-2'}
        >
          <input
            autoFocus
            placeholder={'New group name'}
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            className={
              'w-full !outline-none bg-[#333] rounded-sm px-2 min-w-[150px]'
            }
          />
        </form>
      </Dialog>

      {/*  Create New Group Modal  */}
      <Dialog
        open={changeGroupModalOpen}
        onClose={() => setChangeGroupModalOpen(false)}
      >
        <Column className={'min-w-[300px] min-h-[400px] p-2'}>
          <Tree className={'text-[#ddd] !h-fit'}>
            {IndependentGroupTreeComponent}
          </Tree>
        </Column>
      </Dialog>
    </>
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
