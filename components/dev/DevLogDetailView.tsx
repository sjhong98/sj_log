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
import BoardType from '@/types/dev/BoardType'
import Row from '@/components/flexBox/row'
import { CircularProgress } from '@mui/material'
import { IconPlus } from '@tabler/icons-react'
import updateDevLog from '@/actions/dev/log/updateDevLog'
import getGroupTreeAndPostsByPk from '@/actions/dev/group/getGroupTreeAndPostsByPk'
import { CheckIcon } from 'lucide-react'

interface editableDevLogType extends devLogType {
  blocks: any
}

export default function DevLogDetailView({
  selectedDevLog,
  setSelectedDevLog,
  selectedGroup,
  selectedBoard,
  updateFileTree
}: {
  selectedDevLog: devLogType | null
  setSelectedDevLog: any
  selectedGroup: devLogGroupType | null
  selectedBoard: BoardType | null
  updateFileTree: any
}) {
  const timerRef = useRef<any>(null)
  const initialValue: editableDevLogType = {
    title: 'New Title',
    blocks: null,
    content: '',
    date: new Date().toISOString(),
    groupPk: 0
  }
  const [currentBoard, setCurrentBoard] = useState<BoardType | null>()
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

  useEffect(() => {
    setDevLogForm(
      selectedDevLog
        ? {
            ...selectedDevLog,
            blocks: JSON.parse(selectedDevLog.content)
          }
        : initialValue
    )

    if (!selectedDevLog) {
      setCurrentBoard(null)
    } else {
      getGroupTreeAndPostsByPk(selectedDevLog.groupPk).then(res => {
        setCurrentBoard(res)
      })
    }
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
      let _devLogForm: editableDevLogType = { ...devLogForm }
      // @ts-ignore
      _devLogForm[e.target.name as keyof editableDevLogType] = e.target.value
      setDevLogForm(_devLogForm)
    },
    [devLogForm]
  )

  const autoSave = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)

    let _devLogForm: editableDevLogType = { ...devLogForm }
    _devLogForm.content = JSON.stringify(blocks)

    const updated = await updateDevLog(_devLogForm)
    setEditorStatus(2)
    if (updated) {
      await updateFileTree(_devLogForm.groupPk)
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
    _devLogForm.groupPk = selectedBoard?.currentGroup?.pk ?? -1

    const inserted: devLogType | null = await createDevLog(_devLogForm)
    if (!inserted) return
    setSelectedDevLog(inserted)
    await updateFileTree(_devLogForm.groupPk)
  }, [devLogForm, blocks, selectedBoard])

  return (
    <>
      <Column
        gap={4}
        fullWidth
        className={'w-full rounded-sm min-h-[calc(100vh-200px)] relative'}
      >
        {selectedDevLog && (
          <>
            <Row fullWidth className={'justify-between pl-[55px] pr-4'}>
              <p className={'text-[12px]'}>
                {`${
                  currentBoard?.upperGroupList
                    ? currentBoard?.upperGroupList
                        ?.map((item: devLogGroupType) => item.name)
                        .join(' > ') + ' > '
                    : ''
                }${currentBoard?.currentGroup ? currentBoard.currentGroup.name : ''}`}
              </p>
              {editorStatus === 0 ? (
                <div className={'h-[30px]'}>
                  <button onClick={() => autoSave()}>저장</button>
                </div>
              ) : editorStatus === 1 ? (
                <div className={'h-[30px]'}>
                  <CircularProgress className={`!text-white`} />
                </div>
              ) : (
                <div className={'h-[30px]'}>
                  <CheckIcon />
                </div>
              )}
            </Row>
            <Column gap={4} className={'mt-[-30px]'}>
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
              {/*  block 상태를 별도로 만든 이유는 prev => {} 형태의 함수를 사용하기 위함 (클로저)  */}
              <Editor
                selectedDevLog={selectedDevLog}
                blocks={blocks}
                setBlocks={setBlocks}
              />
            </Column>
          </>
        )}

        {/*  새로운 dev log 생성 버튼  */}
        <button
          onClick={handleCreateNewDevLog}
          className={
            'bg-[#ddd] rounded-full p-1 shadow-lg z-[10] cursor-pointer absolute right-0 bottom-0'
          }
        >
          <IconPlus color={'#333'} />
        </button>
      </Column>
    </>
  )
}
