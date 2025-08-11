'use client'

import Column from '@/components/flexBox/column'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Editor from '@/components/editor/Editor'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import createDevLog from '@/actions/dev/log/createDevLog'
import { toast } from 'react-toastify'
import Row from '@/components/flexBox/row'
import { CircularProgress } from '@mui/material'
import { IconPlus } from '@tabler/icons-react'
import updateDevLog from '@/actions/dev/log/updateDevLog'
import { CheckIcon } from 'lucide-react'
import GroupTreeType from '@/types/dev/GroupTreeType'

interface editableDevLogType extends devLogType {
  blocks: any
}

export default function DevLogDetailView({
  selectedDevLog,
  setSelectedDevLog,
  selectedGroup,
  currentPostList,
  setCurrentPostList,
  groupTree,
  groupList
}: {
  selectedDevLog: devLogType | null
  setSelectedDevLog: any
  selectedGroup: devLogGroupType | null
  currentPostList: { pk: number; title: string }[]
  setCurrentPostList: any
  groupTree: GroupTreeType[]
  groupList: devLogGroupType[]
}) {
  const timerRef = useRef<any>(null)
  const initialValue: editableDevLogType = {
    title: 'New Title',
    blocks: null,
    content: '',
    date: new Date().toISOString(),
    groupPk: 0
  }
  const [blocks, setBlocks] = useState<any>([])
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

  // 3초마다 자동저장 (수정의 경우)
  useEffect(() => {
    if (!selectedDevLog) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setEditorStatus(1)
      await autoSave()
    }, 2000)
  }, [devLogForm, blocks])

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

  const autoSave = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    let _devLogForm: any = { ...devLogForm }
    _devLogForm.content = JSON.stringify(blocks)

    let isEmpty = _devLogForm.content === '[]'

    if (isEmpty) {
      console.log('문서 초기화를 차단하였습니다.')
      _devLogForm.content = undefined
    }

    const updated = await updateDevLog(_devLogForm)
    setEditorStatus(2)
    if (updated) {
      return true
    } else {
      toast.error('자동 저장 실패')
      return false
    }
  }, [devLogForm, blocks, timerRef])

  // editor 수정 이벤트 핸들링
  useEffect(() => {
    setEditorStatus(0)
  }, [devLogForm, blocks])

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

  return (
    <>
      <Column
        className={
          'w-full max-w-[calc(100vw-600px)] h-[calc(100vh-130px)] overflow-y-scroll overflow-x-hidden custom-scrollbar z-[1] relative '
        }
      >
        <div className={'sticky top-0 z-[100] right-0'}>
          <div
            className={'absolute h-full w-full pointer-events-none'}
            id={'absolute-area'}
          >
            {/*  자동저장 관련  */}
            <div className={'h-[30px] absolute top-0 ml-[95%] pr-4 z-[200]'}>
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

            {/*  새로운 dev log 생성 버튼  */}
            <button
              onClick={handleCreateNewDevLog}
              className={
                'bg-[#ddd] rounded-full p-1 shadow-lg cursor-pointer ml-[95%] mt-[calc(100vh-250px)] z-[9999] mr-2 pointer-events-auto'
              }
            >
              <IconPlus color={'#333'} />
            </button>
          </div>
        </div>

        <Column
          gap={4}
          fullWidth
          className={'w-full rounded-sm min-h-[calc(100vh-200px)] relative'}
        >
          {selectedDevLog && (
            <>
              <Row
                fullWidth
                className={'justify-between pl-[55px] pr-4 relative'}
              >
                <p
                  className={'text-[12px]'}
                >{`${parentGroupList?.map(parentGroup => parentGroup.name)?.join(' > ')} > ${selectedDevLog?.title}`}</p>
              </Row>
              <Column gap={4} className={'mt-[-30px]'}>
                {/*  title  */}
                <input
                  name={'title'}
                  value={devLogForm.title}
                  onChange={handleChange}
                  placeholder={'Title'}
                  autoComplete={'off'}
                  className={
                    'w-full !outline-none !text-[30px] ml-[55px] placeholder:text-[#aaa]'
                  }
                />

                {/*  overview  */}
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
                              ? '14px'
                              : level === 2
                                ? '13px'
                                : '12px',
                          marginLeft:
                            level === 1 ? '0px' : level === 2 ? '8px' : '16px'
                        }}
                      >
                        {`${block.content[0]?.text ?? ''}`}
                      </Row>
                    )
                  })}
                </Column>

                {/*  editor  */}
                {/*  block 상태를 별도로 만든 이유는 prev => {} 형태의 함수를 사용하기 위함 (클로저)  */}
                <Editor
                  selectedDevLog={selectedDevLog}
                  blocks={blocks}
                  setBlocks={setBlocks}
                />
              </Column>
            </>
          )}
        </Column>
      </Column>
    </>
  )
}
