'use client'

import { Box, Button, CircularProgress, TextField } from '@mui/material'
import createDiary from '@/actions/diary/createDiary'
import { useQuill } from 'react-quilljs'
import { EmitterSource } from 'quill'
import 'quill/dist/quill.snow.css'
import Row from '@/components/flexBox/row'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import Column from '@/components/flexBox/column'
import Delta from 'quill-delta'
import dayjs from 'dayjs'
import DiaryType from '@/types/DiaryType'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import getDiaryDetail from '@/actions/diary/getDiaryDetail'
import updateDiary from '@/actions/diary/updateDiary'
import confetti from 'canvas-confetti'

const CreateDiary = () => {
  const params = useParams()
  const diaryPk = params?.diaryPk
  const router = useRouter()
  const { quill, quillRef } = useQuill()

  const [pk, setPk] = useState<any>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [contentText, setContentText] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  useEffect(() => {
    router.prefetch('/diary')
  }, [])

  useEffect(() => {
    if (!diaryPk || !quill) return
    ;(async () => {
      const diary = await getDiaryDetail(Number(diaryPk))
      setPk(diary?.pk)
      setDate(new Date(diary?.date ?? new Date()))
      setTitle(diary?.title ?? '')
      setContent(diary?.content ?? '')
      setContentText(diary?.contentText ?? '')
      quill.clipboard.dangerouslyPasteHTML(diary?.content ?? '')
    })()
  }, [diaryPk, quill])

  const handleChangeDate = useCallback((data: any) => {
    setDate(dayjs(data).toDate())
  }, [])

  const handleChangeTitle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }, [])

  // Create Diary
  const handleUploadDiary = async () => {
    setIsUploading(true)

    setTimeout(() => {
      setIsUploading(false)
    }, 3000)

    const diaryData: DiaryType = {
      title,
      content,
      contentText,
      date
    }

    let rowCount: any = 0
    try {
      rowCount = await createDiary(diaryData)
    } catch (e) {
      // @ts-ignore
      toast.error(e)
    }

    if (rowCount) {
      router.push('/diary')
      toast.success('일기 생성 완료')
      const end = Date.now() + 5 // 3 seconds
      const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

      const frame = () => {
        if (Date.now() > end) return

        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors: colors,
          zIndex: 9999
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors: colors,
          zIndex: 9999
        })
        requestAnimationFrame(frame)
      }

      frame()
    } else {
      toast.error('일기 생성 실패')
      setIsUploading(false)
    }
  }

  // Update Diary
  const handleUpdateDiary = async () => {
    setIsUploading(true)

    setTimeout(() => {
      setIsUploading(false)
    }, 3000)

    const diaryData: DiaryType = {
      pk,
      title,
      content,
      contentText,
      date
    }

    const rowCount = await updateDiary(diaryData)

    if (rowCount) {
      toast.success('일기 생성 완료')
      router.push('/diary')
    } else {
      toast.error('일기 생성 실패')
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (!quill) return

    quill.on(
      'text-change',
      (delta: Delta, oldDelta: Delta, source: EmitterSource) => {
        setContentText(quill.getText())
        setContent(quill.root.innerHTML)
      }
    )
  }, [quill])

  return (
    <>
      <>
        <Row fullWidth className={'justify-between'}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker
                label='Date'
                onChange={handleChangeDate}
                value={dayjs(date)}
                format={'YYYY.MM.DD'}
              />
            </DemoContainer>
          </LocalizationProvider>
          <Column className={'justify-end'}>
            {isUploading ? (
              <CircularProgress />
            ) : (
              <Button
                variant={'outlined'}
                className={'h-[80%]'}
                onClick={() => {
                  !diaryPk ? handleUploadDiary() : handleUpdateDiary()
                }}
                disabled={content === '' || title === ''}
              >
                {!diaryPk ? 'upload' : 'update'}
              </Button>
            )}
          </Column>
        </Row>
        <Row fullWidth className={'mt-10'}>
          <TextField
            fullWidth
            value={title}
            onChange={handleChangeTitle}
            variant={'standard'}
            placeholder={'Title'}
            autoComplete={'off'}
          />
        </Row>
        <Box
          className={'w-full h-auto'}
          sx={{
            '& .ql-toolbar': {
              border: 'solid 0px #444 !important'
            }
          }}
        >
          <Box
            ref={quillRef}
            autoCorrect={'off'}
            sx={{
              minHeight: '500px',
              border: 'solid 0px #444 !important',
              '& img': {
                maxHeight: '300px',
                objectFit: 'cover'
              },
              '& p': {
                fontSize: '16px'
              }
            }}
          />
        </Box>
      </>
    </>
  )
}

export default CreateDiary
