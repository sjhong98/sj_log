'use client'

import createGroup from '@/actions/dev/group/createGroup'
import deleteGroup from '@/actions/dev/group/deleteGroup'
import { simpleDevLogType } from '@/actions/dev/group/getPostListByGroupPk'
import toggleGroupPrivacy from '@/actions/dev/group/toggleGroupPrivacy'
import deleteDevLog from '@/actions/dev/log/deleteDevLog'
import searchDevLogByKeyword from '@/actions/dev/log/searchDevLogByKeyword'
import updateParentGroupPk from '@/actions/dev/log/updateParentGroupPk'
import DevLogDetailView from '@/components/dev/DevLogDetailView'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import { Folder, Tree } from '@/components/magicui/file-tree'
import useQueryString from '@/hooks/useQueryString'
import useUser from '@/hooks/useUser'
import BoardType from '@/types/dev/BoardType'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import { Box, Button, Dialog, Drawer, IconButton, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material'
import { IconList, IconTrashFilled } from '@tabler/icons-react'
import { FileIcon, FolderInputIcon, LockIcon, LockOpenIcon, PlusIcon } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import SearchInput from '../search/searchInput'
import { cn } from '@/lib/utils'

const DRAWER_WIDTH = 380

export default function DevLogView({
  list,
  groupTreeProp,
  groupListProp,
  currentPostListProp,
  selectedDevLogProp,
  pinnedDevLogListProp,
  recentDevLogListProp,
}: {
  list: BoardType
  groupTreeProp: GroupTreeType[]
  groupListProp: devLogGroupType[]
  currentPostListProp: simpleDevLogType[] | null
  selectedDevLogProp: devLogType | null
  pinnedDevLogListProp: devLogType[] | null
  recentDevLogListProp: devLogType[] | null
}) {
  const { addQueryString, removeQueryString } = useQueryString()
  const treeRef = useRef<{ expandSpecificTargetedElements: (elements?: any[], selectId?: string) => void }>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const searchInputRef = useRef<any>(null)
  const [currentPostList, setCurrentPostList] = useState<simpleDevLogType[]>(currentPostListProp ?? [])
  const [selectedDevLog, setSelectedDevLog] = useState<devLogType | null>(selectedDevLogProp ?? null)
  const [selectedGroup, setSelectedGroup] = useState<devLogGroupType | null>(null)

  const [temporarySelectedGroup, setTemporarySelectedGroup] = useState<devLogGroupType | null>(null)
  const [currentGroupTree, setCurrentGroupTree] = useState<GroupTreeType[]>(groupTreeProp)
  const [isDevLogGroupPrivate, setIsDevLogGroupPrivate] = useState(false)
  const [groupCreateModalOpen, setGroupCreateModalOpen] = useState(false)
  const [changeGroupModalOpen, setChangeGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState<string>('')
  const [postListLoading, setPostListLoading] = useState(false)
  const [devLogLoading, setDevLogLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [searchResult, setSearchResult] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [devLogListDrawerOpen, setDevLogListDrawerOpen] = useState<boolean>(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 선택된 그룹이 변경될 때 부모 디렉토리들을 자동으로 열기
  useEffect(() => {
    if (selectedGroup) {
      const expandParentGroups = (
        groupTree: GroupTreeType[],
        targetPk: number,
        path: number[] = [],
      ): number[] | null => {
        for (const group of groupTree) {
          if (group.pk === targetPk) {
            return path
          }
          if (group.childGroupList && group.childGroupList.length > 0) {
            const result = expandParentGroups(group.childGroupList, targetPk, [...path, group.pk ?? 0])
            if (result) return result
          }
        }
        return null
      }

      const parentPath = expandParentGroups(currentGroupTree, selectedGroup.pk ?? 0)
      if (parentPath) {
        setExpandedGroups(new Set(parentPath))
      }
    }
  }, [selectedGroup, currentGroupTree])

  // DevLogGroup 요청 핸들러
  const handleClickDevLogGroup = useCallback((e: React.MouseEvent<HTMLDivElement>, group: GroupTreeType) => {
    e.stopPropagation()

    if (!group?.pk) {
      console.error('Group pk is not found')
      return
    }

    addQueryString('devLogGroupPk', group.pk.toString())
    // getPostList(group.pk)
    setIsDevLogGroupPrivate(group.isPrivate ?? false)
    setSelectedGroup(group)
  }, [])

  // DevLogGroup 리시브 핸들러
  useEffect(() => {
    if (currentPostListProp) {
      setCurrentPostList(currentPostListProp)
    }
  }, [currentPostListProp])

  // DevLog 요청 핸들러
  const handleClickDevLog = useCallback(
    async (item?: { pk: number; title: string }) => {
      if (!item?.pk) {
        console.error('Dev log pk is not found')
        return
      }

      addQueryString('devLogPk', item.pk.toString())
      setDevLogLoading(true)

      if (isMobile) {
        setDevLogListDrawerOpen(false)
      }
    },
    [isMobile, selectedDevLog],
  )

  // DevLog 리시브 핸들러
  useEffect(() => {
    setSelectedDevLog(selectedDevLogProp)
    setDevLogLoading(false)
  }, [selectedDevLogProp])

  // Recursive Tree for Navigator
  const returnFolder = useCallback(
    (group: GroupTreeType) => {
      // Leaf Groups
      if (group?.childGroupList?.length === 0) {
        if (!group) return
        return (
          <Folder
            key={group.pk}
            id={group.pk?.toString() ?? ''}
            value={group.name}
            element={group.name}
            onClick={(e) => handleClickDevLogGroup(e, group)}
            isSelectable
            isSelect={selectedGroup?.pk === group.pk}
          />
        )
      }

      return (
        <Folder
          key={group.pk}
          id={group.pk?.toString() ?? ''}
          element={group?.name ?? ''}
          value={group?.name ?? ''}
          onClick={(e) => handleClickDevLogGroup(e, group)}
          isSelectable
          isSelect={selectedGroup?.pk === group.pk}
        >
          {group?.childGroupList?.map((child) => returnFolder(child))}
        </Folder>
      )
    },
    [currentGroupTree, selectedGroup],
  )

  const GroupTreeComponent = useMemo(() => {
    return currentGroupTree.map((child) => returnFolder(child))
  }, [currentGroupTree, selectedGroup, returnFolder])

  // Recursive Tree for Select Group
  const returnIndependentFolder = useCallback(
    (group: GroupTreeType) => {
      // Leaf Groups
      if (group?.childGroupList?.length === 0) {
        if (!group) return
        return (
          <Folder
            key={group.pk}
            id={group.pk?.toString() ?? ''}
            value={group.name}
            element={group.name}
            onClick={(e) => {
              e.stopPropagation()
              if (!group?.pk) return

              setTemporarySelectedGroup(group)
            }}
            isSelectable
            isSelect={temporarySelectedGroup?.pk === group.pk}
          />
        )
      }

      return (
        <Folder
          key={group.pk}
          id={group.pk?.toString() ?? ''}
          element={group?.name ?? ''}
          value={group?.name ?? ''}
          onClick={(e) => {
            e.stopPropagation()
            if (!group?.pk) return

            setTemporarySelectedGroup(group)
          }}
          isSelectable
          isSelect={temporarySelectedGroup?.pk === group.pk}
        >
          {group?.childGroupList?.map((child) => returnIndependentFolder(child))}
        </Folder>
      )
    },
    [currentGroupTree, temporarySelectedGroup],
  )

  const ParentUpdateableGroupTreeComponent = useMemo(() => {
    return currentGroupTree.map((child) => returnIndependentFolder(child))
  }, [currentGroupTree, temporarySelectedGroup, returnIndependentFolder])

  const handleCreateGroup = useCallback(async () => {
    if (!selectedGroup) return
    // setTreeLoading(true)
    try {
      const updatedGroupTree = await createGroup({
        parentGroupPk: selectedGroup.pk ?? 0,
        name: newGroupName,
        isPrivate: true,
      })
      if (!updatedGroupTree) return
      setCurrentGroupTree(updatedGroupTree)
      toast.success('Created new group successfully!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to create new group.')
    } finally {
      setNewGroupName('')
      // setTreeLoading(false)
    }
  }, [selectedGroup, newGroupName])

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return

    // TODO: modify logic
    if (currentPostList?.length && currentPostList?.length > 0) {
      toast.error('Cannot delete group with files or child groups')
      return
    }

    // setTreeLoading(true)
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
    } finally {
      // setTreeLoading(false)
    }
  }, [selectedGroup, currentPostList])

  const handleDeleteDevLog = useCallback(
    async (devLog: devLogType) => {
      if (!devLog.pk || !user) return

      try {
        const deleted = await deleteDevLog(devLog.pk)
        if (deleted) {
          toast.success('Deleted successfully!')

          // 낙관적 업데이트 - 배열에서 삭제된 포스트 제거
          let _currentPostList: { pk: number; title: string }[] = [...currentPostList]
          const idx = _currentPostList.findIndex((post) => post.pk === deleted.pk)
          if (idx !== -1) {
            _currentPostList.splice(idx, 1)
            setCurrentPostList(_currentPostList)
          }

          // 선택된 포스트 초기화
          setSelectedDevLog(null)
          removeQueryString('devLogPk')
        } else toast.error('Failed to delete group')
      } catch (e) {
        console.error(e)
        toast.error('Failed to delete group')
      }
    },
    [currentPostList, user],
  )

  const handleUpdateDevLogParentGroup = useCallback(async () => {
    if (!temporarySelectedGroup?.pk || !selectedDevLog?.pk || !selectedGroup?.pk || !user) return

    // setTreeLoading(true)
    try {
      const updated = await updateParentGroupPk(selectedDevLog.pk, temporarySelectedGroup.pk)

      if (updated) {
        setChangeGroupModalOpen(false)
        setTemporarySelectedGroup(null)

        let _currentPostList: { pk: number; title: string }[] = [...currentPostList]
        const idx = _currentPostList.findIndex((post) => post.pk === updated.pk)
        if (idx !== -1) {
          _currentPostList.splice(idx, 1)
          setCurrentPostList(_currentPostList)
        }
        toast.success('Dev log moved successfully!')
      } else {
        toast.error('Failed to moved parent group')
      }
    } catch (error) {
      console.error('Failed to update parent group:', error)
      toast.error('Failed to move dev log')
    } finally {
      // setTreeLoading(false)
    }
  }, [temporarySelectedGroup, selectedDevLog, selectedGroup, currentPostList, user])

  // 검색 결과에서 키워드 주변 텍스트를 추출하는 함수
  const getContextText = (text: string, keyword: string) => {
    if (!text || !keyword) return ''

    const lowerText = text.toLowerCase()
    const lowerKeyword = keyword.toLowerCase()
    const keywordIndex = lowerText.indexOf(lowerKeyword)

    if (keywordIndex === -1) return ''

    // 키워드 시작 위치와 끝 위치
    const start = keywordIndex
    const end = start + keyword.length

    // 이전 3단어와 이후 3단어를 포함한 범위 계산
    const words = text.split(/\s+/)
    let startWordIndex = 0
    let endWordIndex = words.length - 1

    // 키워드가 포함된 단어의 인덱스 찾기
    let currentPos = 0
    for (let i = 0; i < words.length; i++) {
      const wordLength = words[i].length
      if (currentPos <= start && start < currentPos + wordLength) {
        startWordIndex = Math.max(0, i - 5)
        endWordIndex = Math.min(words.length - 1, i + 5)
        break
      }
      currentPos += wordLength + 1 // 공백 고려
    }

    // 범위 내 단어들을 조합
    const contextWords = words.slice(startWordIndex, endWordIndex + 1)
    let contextText = contextWords.join(' ')

    return contextText
  }

  const handleSearch = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value)
    if (e.target.value === '') {
      setSearchResult([])
      return
    }

    setSearchLoading(true)
    try {
      const result = await searchDevLogByKeyword(e.target.value)
      setSearchResult(result ?? [])
    } catch (error) {
      console.error('Search failed:', error)
      toast.error('Search failed')
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const expandSelectedGroupTree = useCallback(async (groupPks: number[]) => {
    for (let i = 0; i < groupPks.length; i++) {
      const groupPk = groupPks[i]
      const elem = document.getElementById(groupPk.toString())
      if (elem) {
        // Folder 내부의 button 태그를 찾아서 클릭
        const button = elem.querySelector('button')
        if (button) {
          // data-state가 'closed'가 아닐 때만 클릭
          const dataState = button.getAttribute('data-state')
          if (dataState === 'closed') {
            ;(button as HTMLElement).click()
          }
        } else {
          // 버튼을 찾을 수 없으면 요소 자체를 클릭
          elem.click()
        }
      }

      // 마지막 요소가 아니면 100ms 대기
      if (i < groupPks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
  }, [])

  const handleClickResultItem = useCallback(
    async (resultItem: any) => {
      const _devLogData: any = await handleClickDevLog(resultItem)
      expandSelectedGroupTree(_devLogData.group.map((group: any) => group.pk))
      searchInputRef.current?.close()
      setSelectedGroup(groupListProp.find((group) => group.pk === resultItem.groupPk) ?? null)
    },
    [handleClickDevLog, groupListProp, treeRef, expandSelectedGroupTree],
  )

  const togglePrivacy = useCallback(() => {
    if (!user) return

    try {
      let newIsPrivate = !isDevLogGroupPrivate
      toggleGroupPrivacy(selectedGroup?.pk ?? 0, !isDevLogGroupPrivate)
      setIsDevLogGroupPrivate(newIsPrivate)
      toast.success('Group privacy toggled successfully!')
    } catch (error) {
      console.error('Failed to toggle group privacy:', error)
      toast.error('Failed to toggle group privacy')
    }
  }, [isDevLogGroupPrivate, selectedGroup, user])

  const SearchDialog = useMemo(() => {
    return (
      <>
        <Column className={`${isMobile ? 'w-[90vw]' : 'w-[600px]'} overflow-y-hidden`}>
          <input
            autoFocus
            type="text"
            placeholder="Search"
            className="w-full h-12 outline-none px-4 bg-[#222]"
            value={searchKeyword}
            onChange={handleSearch}
          />
          <Column gap={8} className="pt-2 pb-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {searchLoading ? (
              // 검색 로딩 skeleton
              <Column gap={8} className={'fade-in'}>
                {[1, 2, 3].map((i) => (
                  <Column key={i} fullWidth className="rounded-sm pr-1 pl-2 mb-[-5px]">
                    <Row gap={4} className={'items-center mb-2'}>
                      <Skeleton variant="circular" className={'size-4'} />
                      <Skeleton variant="rounded" className={'h-4 flex-1'} />
                    </Row>
                    <Skeleton variant="rounded" className={'h-3 w-3/4'} />
                  </Column>
                ))}
              </Column>
            ) : searchResult.length > 0 ? (
              searchResult.map((resultItem: any, i: number) => {
                const contextText = getContextText(resultItem.text, searchKeyword)
                if (contextText === '') return
                return (
                  <Column
                    key={i}
                    fullWidth
                    className=" cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group/item mb-[-5px]"
                    onClick={() => handleClickResultItem(resultItem)}
                  >
                    <Row gap={4} className={'items-center'}>
                      <FileIcon className="size-4 mt-[1px]" />
                      {`${resultItem.group?.name ?? ''} > ${resultItem.title}`}
                    </Row>
                    <Typography variant="body2" className="text-[#999]">{`...${contextText}...`}</Typography>
                  </Column>
                )
              })
            ) : searchKeyword && !searchLoading ? (
              <Typography variant="body2" className="text-[#999] text-center py-4">
                검색 결과가 없습니다.
              </Typography>
            ) : null}
          </Column>
        </Column>
      </>
    )
  }, [searchKeyword, handleSearch, searchResult, searchLoading, isMobile, handleClickResultItem])

  const NavigationArea = useMemo(() => {
    return (
      <Column
        area-label="navigation-area"
        gap={4}
        fullWidth
        className={'w-full h-full min-w-[300px] p-4 pb-[200px] !pt-0 overflow-auto scrollbar-thin scrollbar-left'}
      >
        <Row className={'relative group/navigation'}>
          <Column gap={20} fullWidth>
            <Row fullWidth gap={8} className={'items-center'}>
              <Row aria-label="search-input-area" fullWidth className={'flex-1'}>
                <SearchInput ref={searchInputRef} dialogComponent={SearchDialog} />
              </Row>
              {isMobile && (
                <IconButton onClick={() => setDevLogListDrawerOpen(false)} className={'text-[#ddd]'}>
                  <IconList />
                </IconButton>
              )}
            </Row>
            <Tree
              aria-label="group-tree"
              ref={treeRef}
              className={'text-[#ddd] !h-fit'}
              initialExpandedItems={Array.from(expandedGroups).map(String)}
            >
              {GroupTreeComponent}
            </Tree>
          </Column>
          {/* Dev Log Group 버튼 셋 */}
          {selectedGroup && user && (
            <Row
              aria-label="group-tree-button-area"
              className={'absolute right-0 top-16 opacity-0 group-hover/navigation:opacity-100'}
            >
              <PlusIcon className={'cursor-pointer'} onClick={() => setGroupCreateModalOpen(true)} />
              <PlusIcon className={'cursor-pointer rotate-[45deg]'} onClick={handleDeleteGroup} />
              {isDevLogGroupPrivate ? (
                <LockIcon className={'cursor-pointer size-4 mt-1 ml-[3px]'} onClick={togglePrivacy} />
              ) : (
                <LockOpenIcon className={'cursor-pointer size-4 mt-1 ml-[3px]'} onClick={togglePrivacy} />
              )}
            </Row>
          )}
        </Row>

        <Column fullWidth gap={4} className={'flex-shrink-0'}>
          {/*  File List  */}
          {isMounted && (
            <Column fullWidth>
              {!postListLoading ? (
                currentPostList
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((item: { pk: number; title: string }, i: number) => {
                    return (
                      <Row
                        key={i}
                        gap={4}
                        fullWidth
                        className={
                          'items-center justify-between cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group/item mb-[-5px]'
                        }
                        onClick={() => handleClickDevLog(item)}
                      >
                        <Row gap={4} className={'w-full items-center'}>
                          <FileIcon className="size-4 mt-[1px]" />
                          <p className="w-full break-all line-clamp-1">{item.title}</p>
                        </Row>
                        <Row className={'group-hover/item:opacity-100 opacity-0 h-10 flex gap-2 items-center'}>
                          {user && (
                            <>
                              {/* Delete Dev Log */}
                              <IconTrashFilled
                                className="cursor-pointer hover:scale-[1] scale-[0.8] duration-100"
                                onClick={() => handleDeleteDevLog({ pk: item.pk, title: item.title } as any)}
                              />
                              {/* Change Parent Group */}
                              <FolderInputIcon
                                className="cursor-pointer hover:scale-[1] scale-[0.8] duration-100"
                                onClick={() => setChangeGroupModalOpen(true)}
                              />
                            </>
                          )}
                        </Row>
                      </Row>
                    )
                  })
              ) : (
                <Column gap={1} className={'fade-in'}>
                  <Skeleton variant="rounded" className={'w-full h-[20px]'} />
                  <Skeleton variant="rounded" className={'w-full h-[20px]'} />
                  <Skeleton variant="rounded" className={'w-full h-[20px]'} />
                  <Skeleton variant="rounded" className={'w-full h-[20px]'} />
                  <Skeleton variant="rounded" className={'w-full h-[20px]'} />
                </Column>
              )}
            </Column>
          )}
        </Column>
      </Column>
    )
  }, [
    currentGroupTree,
    selectedGroup,
    currentPostList,
    postListLoading,
    expandedGroups,
    GroupTreeComponent,
    SearchDialog,
    handleClickDevLog,
    handleDeleteDevLog,
    isDevLogGroupPrivate,
    togglePrivacy,
    isMounted,
  ])

  const MobileNavigationWrapper = useCallback(
    ({ children }: { children: React.ReactNode }) => {
      return (
        <>
          <Box className={'absolute top-2 left-2 z-[10]'}>
            <IconButton onClick={() => setDevLogListDrawerOpen(true)}>
              <IconList color={'#ddd'} />
            </IconButton>
          </Box>
          <Drawer
            open={devLogListDrawerOpen}
            onClose={() => setDevLogListDrawerOpen(false)}
            variant={!isMobile ? 'permanent' : 'temporary'}
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                left: isMobile ? '0px' : '0px',
                overflow: 'hidden',
                backgroundColor: '#050505',
              },
            }}
          >
            <Box className={'bg-[#111] h-full py-4'}>{children}</Box>
          </Drawer>
        </>
      )
    },
    [isMobile, devLogListDrawerOpen],
  )

  return (
    <>
      <Row fullWidth className="h-[var(--inner-content-height)] pt-4">
        {/* PC에서는 navigation area를 고정으로 표시, 모바일에서는 drawer로 표시 */}
        {isMobile ? (
          <MobileNavigationWrapper>{NavigationArea}</MobileNavigationWrapper>
        ) : (
          <Row fullWidth gap={4} className={'flex-[0.3] w-full'}>
            {NavigationArea}
          </Row>
        )}

        {/*  File View Area  */}
        <Column gap={4} fullWidth className={cn('h-full', isMobile ? 'w-[90vw]' : 'flex-[1] w-[70%] relative')}>
          <DevLogDetailView
            selectedDevLog={selectedDevLog}
            setSelectedDevLog={setSelectedDevLog}
            selectedGroup={selectedGroup}
            currentPostList={currentPostList}
            setCurrentPostList={setCurrentPostList}
            groupTree={currentGroupTree}
            groupList={groupListProp}
            devLogLoading={devLogLoading}
            pinnedDevLogList={pinnedDevLogListProp ?? []}
            recentDevLogList={recentDevLogListProp ?? []}
          />
        </Column>
      </Row>

      {/*  Create New Group Modal  */}
      <Dialog open={groupCreateModalOpen} onClose={() => setGroupCreateModalOpen(false)}>
        <form
          onSubmit={(e) => {
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
            onChange={(e) => setNewGroupName(e.target.value)}
            className={'w-full !outline-none bg-[#333] rounded-sm px-2 min-w-[150px]'}
          />
        </form>
      </Dialog>

      {/*  Create New Group Modal  */}
      <Dialog open={changeGroupModalOpen} onClose={() => setChangeGroupModalOpen(false)}>
        <Column className={'min-w-[300px] min-h-[400px] p-2'}>
          <Tree className={'text-[#ddd] !h-fit'}>{ParentUpdateableGroupTreeComponent}</Tree>
          <Button
            fullWidth
            variant="contained"
            size="small"
            className="!mt-auto"
            color="primary"
            onClick={handleUpdateDevLogParentGroup}
          >
            Update Parent Group
          </Button>
        </Column>
      </Dialog>
    </>
  )
}
