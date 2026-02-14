'use client'

import createDevLog from '@/actions/dev/log/createDevLog'
import toggleDevLogPrivacy from '@/actions/dev/log/toggleDevLogPrivacy'
import updateDevLog from '@/actions/dev/log/updateDevLog'
import Editor from '@/components/editor/Editor'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import useUser from '@/hooks/useUser'
import GroupTreeType from '@/types/dev/GroupTreeType'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import { CircularProgress, Skeleton, useMediaQuery, useTheme } from '@mui/material'
import { IconPlus } from '@tabler/icons-react'
import { CheckIcon, LockIcon, LockOpenIcon } from 'lucide-react'
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { toast } from 'react-toastify'

interface editableDevLogType extends devLogType {
  blocks: any
  text: string | null
}

export default function DevLogDetailView({
  selectedDevLog,
  setSelectedDevLog,
  selectedGroup,
  currentPostList,
  setCurrentPostList,
  groupTree,
  groupList,
  devLogLoading
}: {
  selectedDevLog: devLogType | null
  setSelectedDevLog: any
  selectedGroup: devLogGroupType | null
  currentPostList: { pk: number; title: string }[]
  setCurrentPostList: any
  groupTree: GroupTreeType[]
  groupList: devLogGroupType[]
  devLogLoading: boolean
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const timerRef = useRef<any>(null)
  const initialValue: editableDevLogType = {
    title: 'New Title',
    blocks: null,
    content: '',
    date: new Date().toISOString(),
    groupPk: 0,
    text: null,
    isPrivate: false
  }
  const { user } = useUser()

  const [blocks, setBlocks] = useState<any>([])
  const [blockInitializing, setBlockInitializing] = useState(false)
  // 0-수정사항 있음 | 1-저장 중 | 2-수정사항 없음
  const [editorStatus, setEditorStatus] = useState(0)
  const [devLogForm, setDevLogForm] = useState<editableDevLogType>(
    selectedDevLog
      ? {
        ...selectedDevLog,
        blocks: JSON.parse(selectedDevLog.content)
      }
      : initialValue
  )
  const [parentGroupList, setParentGroupList] = useState<devLogGroupType[]>([])
  const [overview, setOverview] = useState([])
  const [isPrivate, setIsPrivate] = useState(false)

  useEffect(() => {
    let _overview: any = []
    blocks.map((block: any) => {
      if (block.type === 'heading') _overview.push(block)
    })
    setOverview(_overview)
  }, [blocks])

  useEffect(() => {
    setDevLogForm(
      selectedDevLog
        ? {
          ...selectedDevLog,
          blocks: JSON.parse(selectedDevLog.content)
        }
        : initialValue
    )

    if (!selectedDevLog?.groupPk) return

    // 조상 리스트 생성
    let parentGroupPk = selectedDevLog.groupPk
    let _parentGroupList: devLogGroupType[] = []
    while (true) {
      const parent = groupList.find(group => group.pk === parentGroupPk)
      if (!parent) return
      _parentGroupList.unshift(parent)
      if (!parent?.parentGroupPk) break
      parentGroupPk = parent.parentGroupPk
    }
    setParentGroupList(_parentGroupList)
    setBlocks(JSON.parse(selectedDevLog.content))
  }, [selectedDevLog])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!selectedDevLog?.pk) return

      let _devLogForm: editableDevLogType = { ...devLogForm }
      // @ts-ignore
      _devLogForm[e.target.name as keyof editableDevLogType] = e.target.value
      setDevLogForm(_devLogForm)

      let _currentPostList = [...currentPostList]
      const idx = _currentPostList.findIndex(
        devLog => devLog.pk === selectedDevLog.pk
      )
      _currentPostList[idx].title = e.target.value
      setCurrentPostList(_currentPostList)
    },
    [devLogForm, currentPostList, selectedDevLog]
  )

  // 3초마다 자동저장 (수정의 경우)
  useEffect(() => {
    (async () => {
      if (!selectedDevLog || !user) return

      // 블럭 초기화된 경우 -> 자동저장 X
      if (blockInitializing) {
        clearTimeout(timerRef.current)
        setBlockInitializing(false)
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(async () => {
        setEditorStatus(1)
        await autoSave()
      }, 2000)
    })()
  }, [devLogForm, blocks])

  // 선택된 devLog가 변경될 때 기존 타이머 제거
  useEffect(() => {
    if (!timerRef.current) return

    clearTimeout(timerRef.current)
  }, [selectedDevLog])

  useEffect(() => {
    setBlockInitializing(true)
  }, [selectedDevLog])

  const autoSave = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    let _devLogForm: any = { ...devLogForm }
    _devLogForm.content = JSON.stringify(blocks)

    const onlyText = blocks.map((block: any) => block.content.map((content: any) => content.text)).flat().join(' ')
    _devLogForm.text = onlyText

    let isEmpty = _devLogForm.content === '[]'

    if (isEmpty) {
      console.log('문서 초기화를 차단하였습니다.')
      _devLogForm.content = undefined
      _devLogForm.text = undefined
    }

    const updated = await updateDevLog(_devLogForm)

    // 업데이트 종료
    setEditorStatus(2)

    if (updated) {
      return true
    } else {
      toast.error('자동 저장 실패')
      return false
    }
  }, [devLogForm, blocks, timerRef, blockInitializing])

  // 새로운 devLog row 생성
  const handleCreateNewDevLog = useCallback(async () => {
    let _devLogForm: editableDevLogType = { ...devLogForm }
    _devLogForm.title = 'New Title'
    _devLogForm.content = JSON.stringify([
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left'
        },
        content: [
          {
            type: 'text',
            text: '',
            styles: {}
          }
        ],
        children: []
      }
    ])
    _devLogForm.groupPk = selectedGroup?.pk ?? -1

    const inserted = await createDevLog(_devLogForm)
    if (!inserted) return

    setSelectedDevLog(inserted)
    let _currentPostList: { pk: number; title: string }[] = [...currentPostList]
    _currentPostList.push({
      pk: inserted.pk,
      title: inserted.title
    })
    setCurrentPostList(_currentPostList)
  }, [devLogForm, blocks, selectedGroup, currentPostList])

  const handleScrollToBlock = useCallback((block: any) => {
    if (!block?.id) return

    const blockElem = document.querySelector(`div[data-id="${block.id}"]`)
    if (!blockElem) return

    blockElem.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, [])

  useEffect(() => {
    setIsPrivate(selectedDevLog?.isPrivate ?? false)
  }, [selectedDevLog])

  const togglePrivacy = useCallback(() => {
    try {
      let newIsPrivate = !isPrivate
      toggleDevLogPrivacy(selectedDevLog?.pk ?? 0, newIsPrivate)
      setIsPrivate(newIsPrivate)
    } catch (error) {
      console.error('Failed to toggle group privacy:', error)
      toast.error('Failed to toggle group privacy')
    }
  }, [selectedDevLog, isPrivate])

  return (
    <>
      <Column
        className={
          isMobile
            ? 'w-full h-[calc(100vh-130px)] overflow-y-scroll overflow-x-hidden custom-scrollbar z-[1] relative'
            : `w-full max-w-[calc(100vw-600px)] h-[calc(100vh-110px)] pb-[200px] overflow-y-scroll overflow-x-hidden custom-scrollbar z-[1] relative`
        }
      >
        <div className={'sticky top-0 z-[100] right-0'}>
          <div
            className={'absolute flex flex-row gap-2 h-full w-full pointer-events-none'}
            id={'absolute-area'}
          >
            {/*  자동저장 관련  */}
            {Boolean(user) && (
              <div className={isMobile ? 'h-[30px] absolute top-0 right-4 pr-2 z-[200]' : 'h-[30px] absolute top-0 ml-[95%] pr-4 z-[200]'}>
                {editorStatus === 0 ? (
                  <button
                    onClick={autoSave}
                    className={
                      'whitespace-nowrap pointer-events-auto cursor-pointer'
                    }
                  >
                    저장
                  </button>
                ) : editorStatus === 1 ? (
                  <CircularProgress className={`!text-white`} />
                ) : (
                  <CheckIcon />
                )}
              </div>
            )
            }

            {/* 공개 여부 관련 */}
            {Boolean(user) && (
              <div className={isMobile ? 'h-[30px] absolute top-0 right-4 pr-2 z-[201] pointer-events-auto' : 'h-[30px] absolute top-0 ml-[90%] pr-4 z-[201] pointer-events-auto'}>
                {isPrivate ? (
                  <LockIcon className={'cursor-pointer size-4 mt-1 ml-[3px]'} onClick={togglePrivacy} />
                ) : (
                  <LockOpenIcon className={'cursor-pointer size-4 mt-1 ml-[3px]'} onClick={togglePrivacy} />
                )}
              </div>
            )
            }

            {/*  새로운 dev log 생성 버튼  */}
            {Boolean(user) && (
              <button
                onClick={handleCreateNewDevLog}
                className={
                  isMobile
                    ? 'bg-[#ddd] rounded-full p-2 shadow-lg cursor-pointer absolute bottom-4 right-4 z-[9999] pointer-events-auto'
                    : 'bg-[#ddd] rounded-full p-1 shadow-lg cursor-pointer ml-[95%] mt-[calc(100vh-250px)] z-[9999] mr-2 pointer-events-auto aspect-square size-8'
                }
              >
                <IconPlus color={'#333'} />
              </button>
            )
            }
          </div>
        </div>

        <Column
          gap={4}
          fullWidth
          className={'w-full rounded-sm min-h-[calc(100vh-200px)] relative'}
        >
          {devLogLoading ? (
            // DevLog 로딩 중일 때만 skeleton 표시
            <Column gap={4} className={isMobile ? 'px-4' : 'pl-[55px] pr-12'}>
              <Column gap={2} className={'mt-4'}>
                <Skeleton variant='rounded' className={'w-full h-[100px]'} />
                <Skeleton variant='rounded' className={'w-full h-[100px]'} />
                <Skeleton variant='rounded' className={'w-full h-[100px]'} />
              </Column>
            </Column>
          ) : selectedDevLog ? (
            <>
              <Row
                fullWidth
                className={isMobile ? 'justify-between px-0 relative' : 'justify-between pl-[55px] pr-4 relative'}
              >
                <p
                  className={isMobile ? 'text-[10px] text-[#999]' : 'text-[12px]'}
                >{`${parentGroupList?.map(parentGroup => parentGroup.name)?.join(' > ')} > ${selectedDevLog?.title}`}</p>
              </Row>
              <Column gap={4} className={isMobile ? 'mt-2' : 'mt-[-30px]'}>
                {/*  title  */}
                <input
                  name={'title'}
                  value={devLogForm.title}
                  onChange={handleChange}
                  placeholder={'Title'}
                  autoComplete={'off'}
                  disabled={!Boolean(user)}
                  className={
                    isMobile
                      ? 'w-full !outline-none !text-[24px] px-4 placeholder:text-[#aaa]'
                      : 'w-full !outline-none !text-[30px] ml-[55px] placeholder:text-[#aaa]'
                  }
                />

                {/*  overview - 모바일에서는 더 간결하게 표시 */}
                {!isMobile && (
                  <Column className={'pl-[55px] cursor-pointer font-bold'}>
                    {overview.map((block: any) => {
                      const level = block.props.level
                      return (
                        <Row
                          key={block.id}
                          onClick={() => handleScrollToBlock(block)}
                          className={'mt-[-2px]'}
                          style={{
                            fontSize:
                              level === 1
                                ? '16px'
                                : level === 2
                                  ? '14px'
                                  : '12px',
                            marginLeft:
                              level === 1 ? '0px' : level === 2 ? '8px' : '16px',
                            marginTop:
                              level === 1 ? '8px' : level === 2 ? '6px' : '0px',
                            fontWeight:
                              level === 1 ? 'black' : level === 2 ? 'semibold' : 'normal'
                          }}
                        >
                          {`${block.content[0]?.text ?? ''}`}
                        </Row>
                      )
                    })}
                  </Column>
                )}

                {/*  editor  */}
                {/*  block 상태를 별도로 만든 이유는 prev => {} 형태의 함수를 사용하기 위함 (클로저)  */}
                <Editor
                  id={selectedDevLog?.pk ?? 0}
                  selectedDevLog={selectedDevLog}
                  blocks={blocks}
                  setBlocks={setBlocks}
                  disabled={!Boolean(user)}
                  setBlockInitializing={setBlockInitializing}
                />
              </Column>
            </>
          ) : null}
        </Column>
      </Column>
    </>
  )
}
