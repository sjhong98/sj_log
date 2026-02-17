'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import {
  ListItem,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import Image from 'next/image'
import DiaryType from '@/types/DiaryType'

const PORTAL_ID = 'root-portal'

type DiaryListPortalProps = {
  diaryList: DiaryType[] | null | undefined
  onDiaryClick: (diaryPk: number) => void | Promise<void>
}

export default function DiaryListPortal({
  diaryList,
  onDiaryClick
}: DiaryListPortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const content = useMemo(() => {
    if (!diaryList || !Array.isArray(diaryList)) return null

    return (
      <Column className='md:w-[240px] w-[60px] h-screen bg-neutral-950 overflow-y-auto custom-scrollbar'>
        <Column className='w-full flex-shrink-0'>
          {diaryList.map((diary: DiaryType, index: number) => (
            <Fragment key={index}>
              {diary.isNewMonth && (
                <Column
                  fullWidth
                  className={
                    'justify-center items-center mt-4 py-1 gap-2 bg-[var(--color-background)]'
                  }
                >
                  {diary.isNewYear && (
                    <Typography variant={'body1'}>
                      {dayjs(diary.date).format('YYYY')}
                    </Typography>
                  )}
                  <Typography variant={'body2'}>
                    {dayjs(diary.date).format('M월')}
                  </Typography>
                </Column>
              )}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={async () => {
                    if (!diary.pk) return
                    await onDiaryClick(diary.pk)
                  }}
                >
                  <Row
                    fullWidth
                    gap={1}
                    className={'md:justify-between justify-center items-center h-[50px]'}
                  >
                    <Typography variant={'subtitle2'}>
                      {dayjs(diary.date).get('date')}
                    </Typography>
                    <ListItemText
                      color={'var(--color-foreground)'}
                      className={'!line-clamp-1 md:block hidden'}
                      primary={diary.title}
                    />
                    {diary.thumbnail && (
                      <Image
                        src={diary.thumbnail}
                        alt={diary.title}
                        width={35}
                        height={35}
                        className={
                          'object-cover rounded-md aspect-square md:block hidden'
                        }
                      />
                    )}
                  </Row>
                </ListItemButton>
              </ListItem>
            </Fragment>
          ))}
        </Column>
      </Column>
    )
  }, [diaryList, onDiaryClick])

  if (!mounted || typeof document === 'undefined') return null

  const container = document.getElementById(PORTAL_ID)
  if (!container || !content) return null

  return createPortal(content, container)
}
