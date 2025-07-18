'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import React, { useCallback, useMemo, useState } from 'react'
import BoardType from '@/types/dev/BoardType'
import { Folder, Tree } from '@/components/magicui/file-tree'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { FileIcon, FolderInputIcon, PlusIcon } from 'lucide-react'
import DevLogDetailView from '@/components/dev/DevLogDetailView'
import { toast } from 'react-toastify'
import createGroup from '@/actions/dev/group/createGroup'
import { Dialog, Skeleton } from '@mui/material'
import CustomPopper from '@/components/popper/CustomPopper'
import { IconTrashFilled } from '@tabler/icons-react'
import updateParentGroupPk from '@/actions/dev/log/updateParentGroupPk'
import deleteGroup from '@/actions/dev/group/deleteGroup'
import deleteDevLog from '@/actions/dev/log/deleteDevLog'
import getPostListByGroupPk from '@/actions/dev/group/getPostListByGroupPk'

export default function DevLogView({
  list,
  groupTree,
  groupList
}: {
  list: BoardType
  groupTree: GroupTreeType[]
  groupList: devLogGroupType[]
}) {
  const [currentPostList, setCurrentPostList] = useState<devLogType[]>([])
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
  const [postListLoading, setPostListLoading] = useState(false)

  const handleClickDevLog = useCallback(async (item?: devLogType) => {
    if (!item) return
    setSelectedDevLog(item)
  }, [])

  const getPostList = useCallback(async (groupPk?: number) => {
    if (!groupPk) return

    setPostListLoading(true)
    const postList = await getPostListByGroupPk(groupPk)
    setCurrentPostList(postList)
    setPostListLoading(false)
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
              getPostList(group.pk)
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
            getPostList(group.pk)
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
              else handleUpdateDevLogParentGroup()
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
            else handleUpdateDevLogParentGroup()
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

  const handleCreateGroup = useCallback(async () => {
    if (!selectedGroup) return
    try {
      const updatedGroupTree = await createGroup({
        parentGroupPk: selectedGroup.pk ?? 0,
        name: newGroupName
      })
      if (!updatedGroupTree) return
      setCurrentGroupTree(updatedGroupTree)
      toast.success('Created new group successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to create new group.')
    } finally {
      setNewGroupName('')
    }
  }, [selectedGroup, newGroupName])

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return

    // TODO: modify logic
    if (currentPostList?.length && currentPostList?.length > 0) {
      toast.error('Cannot delete group with files or child groups')
      return
    }

    try {
      const updatedGroupTree = await deleteGroup(selectedGroup?.pk ?? 0)
      if (updatedGroupTree) {
        toast.success('Deleted group successfully!')
        setCurrentGroupTree(updatedGroupTree)
      } else {
        toast.error('Failed to delete group.')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete group.')
    }
  }, [selectedGroup])

  const handleDeleteDevLog = useCallback(
    async (devLog: devLogType) => {
      if (!devLog.pk) return

      try {
        const deleted = await deleteDevLog(devLog.pk)
        if (deleted) {
          toast.success('Deleted successfully!')

          let _currentPostList = [...currentPostList]
          const idx = _currentPostList.findIndex(
            devLog => devLog.pk === deleted.pk
          )
          _currentPostList.splice(idx, 1)
          setCurrentPostList(_currentPostList)
        } else toast.error('Failed to delete group')
      } catch (e) {
        console.error(e)
        toast.error('Failed to delete group')
      }
    },
    [currentPostList]
  )

  const handleUpdateDevLogParentGroup = useCallback(async () => {
    if (
      !temporarySelectedGroup?.pk ||
      !selectedDevLog?.pk ||
      !selectedGroup?.pk
    )
      return

    const updated = await updateParentGroupPk(
      selectedDevLog.pk,
      temporarySelectedGroup.pk
    )

    if (updated) {
      setChangeGroupModalOpen(false)
      setTemporarySelectedGroup(null)

      let _currentPostList = [...currentPostList]
      const idx = _currentPostList.findIndex(devLog => devLog.pk === updated.pk)
      _currentPostList.splice(idx, 1)
      setCurrentPostList(_currentPostList)
      toast.success('Dev log moved successfully!')
    } else {
      toast.error('Failed to moved parent group')
    }
  }, [temporarySelectedGroup, selectedDevLog, selectedGroup])

  return (
    <>
      <Row fullWidth gap={4} className={'min-w-[200px] bg-[#050505]'}>
        {/*  Navigation Area  */}
        <Column gap={4} fullWidth className={'min-w-[380px] max-w-[380px]'}>
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
              {!postListLoading ? (
                currentPostList.map((item: devLogType, i: number) => {
                  const isPost = 'content' in item
                  if (!isPost) return
                  return (
                    <Row
                      key={i}
                      gap={1}
                      fullWidth
                      className={
                        'items-center justify-between cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group mb-[-5px]'
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
                              function: () => handleDeleteDevLog(item)
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
                })
              ) : (
                <Column gap={1} className={'fade-in'}>
                  <Skeleton variant='rounded' className={'w-full h-[20px]'} />
                  <Skeleton variant='rounded' className={'w-full h-[20px]'} />
                  <Skeleton variant='rounded' className={'w-full h-[20px]'} />
                </Column>
              )}
            </Column>
          </Column>
        </Column>

        {/*  File View Area  */}
        <Column
          gap={4}
          fullWidth
          className={'max-w-[calc(100vw-750px)] min-w-[calc(100vw-750px)]'}
        >
          <DevLogDetailView
            selectedDevLog={selectedDevLog}
            setSelectedDevLog={setSelectedDevLog}
            selectedGroup={selectedGroup}
            currentPostList={currentPostList}
            setCurrentPostList={setCurrentPostList}
            groupTree={currentGroupTree}
            groupList={groupList}
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
