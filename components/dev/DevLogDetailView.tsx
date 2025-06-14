'use client'

import Column from '@/components/flexBox/column'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import Editor from '@/components/editor/Editor'
import { devLogGroupType, devLogType } from '@/types/schemaType'
import createDevLog from '@/actions/dev/log/createDevLog'
import { toast } from 'react-toastify'
import BoardType from '@/types/dev/BoardType'

interface editableDevLogType extends devLogType {
  blocks: any
}

export default function DevLogDetailView({
  selectedDevLog,
  selectedGroup,
  currentBoard
}: {
  selectedDevLog: devLogType | null
  selectedGroup: devLogGroupType | null
  currentBoard: BoardType | null
}) {
  const timerRef = useRef<any>(null)
  const initialValue: editableDevLogType = {
    title: '',
    blocks: null,
    content: '',
    date: new Date().toISOString(),
    groupPk: 0
  }
  const [blocks, setBlocks] = useState<any>([])
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
  }, [selectedDevLog])

  // 3초마다 자동저장
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      handleClickSave()
    }, 2000)
  }, [blocks])

  useEffect(() => {
    if (!selectedDevLog?.pk) return

    let _devLogForm: devLogType = { ...devLogForm }
    _devLogForm.groupPk = selectedDevLog.pk
    // @ts-ignore
    setDevLogForm(_devLogForm)
  }, [selectedDevLog])

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let _devLogForm: editableDevLogType = { ...devLogForm }
      // @ts-ignore
      _devLogForm[e.target.name as keyof editableDevLogType] = e.target.value
      setDevLogForm(_devLogForm)
    },
    [devLogForm]
  )

  const handleClickSave = useCallback(async () => {
    let _devLogForm: editableDevLogType = { ...devLogForm }
    _devLogForm.content = JSON.stringify(blocks)
    _devLogForm.groupPk = currentBoard?.currentGroup?.pk ?? -1
    const rows = await createDevLog(_devLogForm)
    if (rows) {
      toast.success('자동 저장 완료')
    } else {
      toast.error('Failed to save Dev log.')
    }
  }, [devLogForm, blocks, currentBoard])

  return (
    <>
      <Column gap={4} className={'w-full'}>
        <p className={'text-[12px]'}>
          {`${
            currentBoard?.upperGroupList
              ? currentBoard?.upperGroupList
                  ?.map((item: devLogGroupType) => item.name)
                  .join(' > ') + ' > '
              : ''
          }${currentBoard?.currentGroup ? currentBoard.currentGroup.name : 'root'}`}
        </p>
        <input
          name={'title'}
          value={devLogForm.title}
          onChange={handleChange}
          placeholder={'Title'}
          autoComplete={'off'}
          className={
            'w-full !outline-none !text-[30px] ml-[52px] placeholder:text-[#aaa]'
          }
        />
        {/*  block 상태를 별도로 만든 이유는 prev => {} 형태의 함수를 사용하기 위함 (클로저 이슈)  */}
        <Editor
          selectedDevLog={selectedDevLog}
          blocks={blocks}
          setBlocks={setBlocks}
        />
      </Column>
    </>
  )
}
