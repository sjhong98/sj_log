'use client'

import Column from '@/components/flexBox/column'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import Row from '@/components/flexBox/row'
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import BoardType from '@/types/dev/BoardType'
import { Folder, Tree } from '@/components/magicui/file-tree'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { FileIcon, FolderInputIcon, PlusIcon } from 'lucide-react'
import DevLogDetailView from '@/components/dev/DevLogDetailView'
import { toast } from 'react-toastify'
import createGroup from '@/actions/dev/group/createGroup'
import { Dialog, Skeleton, Typography, useMediaQuery, useTheme, Box, Drawer, IconButton } from '@mui/material'
import CustomPopper from '@/components/popper/CustomPopper'
import { IconTrashFilled, IconList } from '@tabler/icons-react'
import updateParentGroupPk from '@/actions/dev/log/updateParentGroupPk'
import deleteGroup from '@/actions/dev/group/deleteGroup'
import deleteDevLog from '@/actions/dev/log/deleteDevLog'
import getPostListByGroupPk from '@/actions/dev/group/getPostListByGroupPk'
import getDevLogByPk from '@/actions/dev/log/getDevLogByPk'
import SearchInput from '../search/searchInput'
import searchDevLogByKeyword from '@/actions/dev/log/searchDevLogByKeyword'

const drawerWidth = 380

export default function DevLogView({
  list,
  groupTree,
  groupList
}: {
  list: BoardType
  groupTree: GroupTreeType[]
  groupList: devLogGroupType[]
}) {
  const treeRef = useRef<{ expandSpecificTargetedElements: (elements?: any[], selectId?: string) => void }>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const searchInputRef = useRef<any>(null)
  const [currentPostList, setCurrentPostList] = useState<{ pk: number; title: string }[]>([])
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
  const [devLogLoading, setDevLogLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [searchResult, setSearchResult] = useState<any[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
  const [devLogListDrawerOpen, setDevLogListDrawerOpen] = useState<boolean>(false)
  const [treeLoading, setTreeLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  // selectedDevLog가 변경될 때 devLogLoading을 false로 설정
  useEffect(() => {
    if (selectedDevLog) {
      setDevLogLoading(false)
    }
  }, [selectedDevLog])

  // 선택된 그룹이 변경될 때 부모 디렉토리들을 자동으로 열기
  useEffect(() => {
    if (selectedGroup) {
      const expandParentGroups = (groupTree: GroupTreeType[], targetPk: number, path: number[] = []): number[] | null => {
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

  const handleClickDevLog = useCallback(async (item?: { pk: number; title: string }) => {
    if (!item?.pk) return
    
    setDevLogLoading(true)
    try {
      const devLogData = await getDevLogByPk(item.pk)
      if (devLogData) {
        setSelectedDevLog(devLogData)
        // 모바일에서 devLog 선택 시 drawer 닫기
        if (isMobile) {
          setDevLogListDrawerOpen(false)
        }
      }
      return devLogData
    } catch (error) {
      console.error('Failed to fetch dev log:', error)
      toast.error('Failed to load dev log')
    } finally {
      setDevLogLoading(false)
    }
  }, [isMobile])

  const getPostList = useCallback(async (groupPk?: number) => {
    if (!groupPk) return

    setPostListLoading(true)
    try {
      const postList = await getPostListByGroupPk(groupPk)
      setCurrentPostList(postList)
    } catch (error) {
      console.error('Failed to fetch post list:', error)
      toast.error('Failed to load post list')
    } finally {
      setPostListLoading(false)
    }
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
            id={group.pk?.toString() ?? ''}
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
          id={group.pk?.toString() ?? ''}
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
    [currentGroupTree, selectedGroup, getPostList]
  )

  const GroupTreeComponent = useMemo(() => {
    if (treeLoading) {
      return (
        <Column gap={2} className={'fade-in'}>
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
        </Column>
      )
    }
    return currentGroupTree.map(child => returnFolder(child))
  }, [currentGroupTree, selectedGroup, returnFolder, treeLoading])

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
          id={group.pk?.toString() ?? ''}
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
    if (treeLoading) {
      return (
        <Column gap={2} className={'fade-in'}>
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
          <Skeleton variant='rounded' className={'w-full h-[24px]'} />
        </Column>
      )
    }
    return currentGroupTree.map(child => returnIndependentFolder(child))
  }, [currentGroupTree, temporarySelectedGroup, returnIndependentFolder, treeLoading])

  const handleCreateGroup = useCallback(async () => {
    if (!selectedGroup) return
    setTreeLoading(true)
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
      setTreeLoading(false)
    }
  }, [selectedGroup, newGroupName])

  const handleDeleteGroup = useCallback(async () => {
    if (!selectedGroup) return

    // TODO: modify logic
    if (currentPostList?.length && currentPostList?.length > 0) {
      toast.error('Cannot delete group with files or child groups')
      return
    }

    setTreeLoading(true)
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
      setTreeLoading(false)
    }
  }, [selectedGroup, currentPostList])

  const handleDeleteDevLog = useCallback(
    async (devLog: devLogType) => {
      if (!devLog.pk) return

      try {
        const deleted = await deleteDevLog(devLog.pk)
        if (deleted) {
          toast.success('Deleted successfully!')

          let _currentPostList: { pk: number; title: string }[] = [...currentPostList]
          const idx = _currentPostList.findIndex(
            post => post.pk === deleted.pk
          )
          if (idx !== -1) {
            _currentPostList.splice(idx, 1)
            setCurrentPostList(_currentPostList)
          }
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

    setTreeLoading(true)
    try {
      const updated = await updateParentGroupPk(
        selectedDevLog.pk,
        temporarySelectedGroup.pk
      )

      if (updated) {
        setChangeGroupModalOpen(false)
        setTemporarySelectedGroup(null)

        let _currentPostList: { pk: number; title: string }[] = [...currentPostList]
        const idx = _currentPostList.findIndex(post => post.pk === updated.pk)
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
      setTreeLoading(false)
    }
  }, [temporarySelectedGroup, selectedDevLog, selectedGroup, currentPostList])

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
    if(e.target.value === '') {
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
      if(elem) {
        // Folder 내부의 button 태그를 찾아서 클릭
        const button = elem.querySelector('button')
        if (button) {
          // data-state가 'closed'가 아닐 때만 클릭
          const dataState = button.getAttribute('data-state')
          if (dataState === 'closed') {
            (button as HTMLElement).click()
          }
        } else {
          // 버튼을 찾을 수 없으면 요소 자체를 클릭
          elem.click()
        }
      }

      // 마지막 요소가 아니면 100ms 대기
      if (i < groupPks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }, [])

  const handleClickResultItem = useCallback(async (resultItem: any) => {
    const _devLogData = await handleClickDevLog(resultItem)
    expandSelectedGroupTree(_devLogData.group.map((group: any) => group.pk))
    searchInputRef.current?.close()
    setSelectedGroup(groupList.find(group => group.pk === resultItem.groupPk) ?? null)
  }, [handleClickDevLog, groupList, treeRef, expandSelectedGroupTree])

  const SearchDialog = useMemo(() => {
    return (
      <>
        <Column className={`${isMobile ? 'w-[90vw]' : 'w-[600px]'} overflow-y-hidden`}>
          <input autoFocus type="text" placeholder='Search' className='w-full h-12 outline-none px-4 bg-[#222]' value={searchKeyword} onChange={handleSearch} />
          <Column gap={2} className='pt-2 pb-6 max-h-[80vh] overflow-y-auto custom-scrollbar'>
            {searchLoading ? (
              // 검색 로딩 skeleton
              <Column gap={2} className={'fade-in'}>
                {[1, 2, 3].map((i) => (
                  <Column key={i} fullWidth className='rounded-sm pr-1 pl-2 mb-[-5px]'>
                    <Row gap={1} className={'items-center mb-2'}>
                      <Skeleton variant='circular' className={'size-4'} />
                      <Skeleton variant='rounded' className={'h-4 flex-1'} />
                    </Row>
                    <Skeleton variant='rounded' className={'h-3 w-3/4'} />
                  </Column>
                ))}
              </Column>
            ) : searchResult.length > 0 ? (
              searchResult.map((resultItem: any, i: number) => {
                const contextText = getContextText(resultItem.text, searchKeyword)
                if(contextText === '') return
                return (
                  <Column key={i} fullWidth className=' cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group/item mb-[-5px]' onClick={() => handleClickResultItem(resultItem)}>
                    <Row gap={1} className={'items-center'}>
                      <FileIcon className='size-4 mt-[1px]' />
                      {`${resultItem.group?.name ?? ''} > ${resultItem.title}`}
                    </Row>
                    <Typography variant='body2' className='text-[#999]'>{`...${contextText}...`}</Typography>
                  </Column>
                )
              })
            ) : searchKeyword && !searchLoading ? (
              <Typography variant='body2' className='text-[#999] text-center py-4'>
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
      <Column gap={4} fullWidth className={'min-w-[380px] max-w-[380px] min-h-screen p-4'}>
        <Row className={'relative group/navigation'}>
          <Column gap={2} fullWidth>
            <Row fullWidth gap={2} className={'items-center'}>
              <Row fullWidth className={'flex-1'}>
                <SearchInput ref={searchInputRef} dialogComponent={SearchDialog} />
              </Row>
              {isMobile && (
                <IconButton 
                  onClick={() => setDevLogListDrawerOpen(false)}
                  className={'text-[#ddd]'}
                >
                  <IconList />
                </IconButton>
              )}
            </Row>
            {treeLoading ? (
              <Column gap={2} className={'fade-in'}>
                <Skeleton variant='rounded' className={'w-full h-[24px]'} />
                <Skeleton variant='rounded' className={'w-full h-[24px]'} />
                <Skeleton variant='rounded' className={'w-full h-[24px]'} />
                <Skeleton variant='rounded' className={'w-full h-[24px]'} />
              </Column>
            ) : (
              <Tree 
                ref={treeRef}
                className={'text-[#ddd] !h-fit'} 
                initialExpandedItems={Array.from(expandedGroups).map(String)}
              >
                {GroupTreeComponent}
              </Tree>
            )}
          </Column>
          {selectedGroup && (
            <Row
              className={
                'absolute right-0 top-16 opacity-0 group-hover/navigation:opacity-100'
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
              currentPostList.sort((a, b) => a.title.localeCompare(b.title)).map((item: { pk: number; title: string }, i: number) => {
                return (
                  <Row
                    key={i}
                    gap={1}
                    fullWidth
                    className={
                      'items-center justify-between cursor-pointer rounded-sm pr-1 pl-2 hover:bg-stone-800 group/item mb-[-5px]'
                    }
                    onClick={() => handleClickDevLog(item)}
                  >
                    <Row gap={1} className={'w-full items-center'}>
                      <FileIcon className='size-4 mt-[1px]' />
                      <p className='w-full break-all line-clamp-1'>
                      {item.title}
                      </p>
                    </Row>
                    <Row
                      className={
                        'group-hover/item:opacity-100 opacity-0 scale-[0.8] hover:scale-[1]'
                      }
                    >
                      <CustomPopper
                        buttons={[
                          {
                            icon: <IconTrashFilled />,
                            function: () => handleDeleteDevLog({ pk: item.pk, title: item.title } as any)
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
                <Skeleton variant='rounded' className={'w-full h-[20px]'} />
                <Skeleton variant='rounded' className={'w-full h-[20px]'} />
              </Column>
            )}
          </Column>
        </Column>
      </Column>
    )
  }, [currentGroupTree, selectedGroup, currentPostList, postListLoading, expandedGroups, GroupTreeComponent, SearchDialog, handleClickDevLog, handleDeleteDevLog, treeLoading])

  const RenderedDevLogList = useMemo(() => {
    return (
      <>
        {isMobile && (
          <Box className={'absolute top-12 left-2 z-[10]'}>
            <IconButton onClick={() => setDevLogListDrawerOpen(true)}>
              <IconList color={'#ddd'} />
            </IconButton>
          </Box>
        )}
        <Drawer
          open={devLogListDrawerOpen}
          onClose={() => setDevLogListDrawerOpen(false)}
          variant={!isMobile ? 'permanent' : 'temporary'}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              left: isMobile ? '0px' : '0px',
              overflow: 'hidden',
              backgroundColor: '#050505'
            }
          }}
        >
          <Box className={'bg-[#111]'}> 
            {NavigationArea}
          </Box>
        </Drawer>
      </>
    )
  }, [isMobile, devLogListDrawerOpen, NavigationArea])

  return (
    <>
      <Box sx={{ display: 'flex', width: '100%' }}>
        {/* PC에서는 navigation area를 고정으로 표시, 모바일에서는 drawer로 표시 */}
        {!isMobile ? (
          <Row fullWidth gap={4} className={'min-w-[200px]'}>
            {NavigationArea}
          </Row>
        ) : (
          RenderedDevLogList
        )}

        {/*  File View Area  */}
        <Column
          gap={4}
          fullWidth
          className={isMobile ? 'w-[90vw]' : 'max-w-[calc(100vw-750px)] min-w-[calc(100vw-750px)]'}
        >
          <DevLogDetailView
            selectedDevLog={selectedDevLog}
            setSelectedDevLog={setSelectedDevLog}
            selectedGroup={selectedGroup}
            currentPostList={currentPostList}
            setCurrentPostList={setCurrentPostList}
            groupTree={currentGroupTree}
            groupList={groupList}
            devLogLoading={devLogLoading}
          />
        </Column>
      </Box>

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
          {treeLoading ? (
            <Column gap={2} className={'fade-in'}>
              <Skeleton variant='rounded' className={'w-full h-[24px]'} />
              <Skeleton variant='rounded' className={'w-full h-[24px]'} />
              <Skeleton variant='rounded' className={'w-full h-[24px]'} />
              <Skeleton variant='rounded' className={'w-full h-[24px]'} />
            </Column>
          ) : (
            <Tree className={'text-[#ddd] !h-fit'}>
              {IndependentGroupTreeComponent}
            </Tree>
          )}
        </Column>
      </Dialog>
    </>
  )
}
