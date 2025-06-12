'use client'

import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import dayjs from 'dayjs'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { IconList, IconPencil, IconPlus } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import getDiaryDetail from '@/actions/diary/getDiaryDetail'
import 'react-perfect-scrollbar/dist/css/styles.css'
import CommentType from '@/types/CommentType'
import createComment from '@/actions/diary/comment/createComment'
import { toast } from 'react-toastify'
import PerfectScrollbar from 'react-perfect-scrollbar'
import DiaryType from '@/types/DiaryType'
import Image from 'next/image'
import ModifyPopper from '@/components/popper/ModifyPopper'
import modifyComment from '@/actions/diary/comment/modifyComment'
import deleteComment from '@/actions/diary/comment/deleteComment'
import deleteDiary from '@/actions/diary/deleteDiary'

const drawerWidth = 250

export default function DiaryList({ list }: any) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [diaryList, setDiaryList] = useState<DiaryType[]>(list)
  const [diaryListDrawerOpen, setDiaryListDrawerOpen] = useState<boolean>(false)
  const [selectedDiary, setSelectedDiary] = useState<any>(null)
  const [comments, setComments] = useState<any>([])
  const [comment, setComment] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)
  const [confirmDeleteDiaryModalOpen, setConfirmDeleteDiaryModalOpen] =
    useState(false)
  const [selectedComment, setSelectedComment] = useState<CommentType | null>(
    null
  )
  const [modifyingComment, setModifyingComment] = useState<CommentType | null>(
    null
  )

  const formatDiaryList = useCallback((list: any[]) => {
    let _diaryList: any = [...list]
    _diaryList.forEach((_: any, i: number) => {
      if (i > 0) {
        _diaryList[i].isNewYear = !dayjs(_diaryList[i - 1].date).isSame(
          dayjs(_diaryList[i].date),
          'year'
        )
        _diaryList[i].isNewMonth = !dayjs(_diaryList[i - 1].date).isSame(
          dayjs(_diaryList[i].date),
          'month'
        )
      } else {
        _diaryList[i].isNewYear = true
        _diaryList[i].isNewMonth = true
      }
    })
    return _diaryList
  }, [])

  useEffect(() => {
    if (!list?.[0]) return

    handleClickDiary(list[0].pk)
  }, [])

  const handleClickAdd = useCallback(() => {
    router.push('/diary/create')
  }, [])

  const getTitleAndDate = useCallback(
    (diaryPk: number) => {
      const currentDiary = diaryList.find((d: any) => d.pk === diaryPk)
      if (!currentDiary) return
      setSelectedDiary({
        date: currentDiary.date,
        title: currentDiary.title
      })
      setLoadingContent(true)
    },
    [diaryList]
  )

  const handleClickDiary = useCallback(
    async (diaryPk: number) => {
      getTitleAndDate(diaryPk)

      getDiaryDetail(diaryPk).then((diary: any) => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(diary?.content ?? '', 'text/html')
        const images = doc.querySelectorAll('img')
        images.forEach(img => {
          img.style.maxHeight = '300px'
          img.style.objectFit = 'cover'
        })
        const modifiedHtml = doc.body.innerHTML
        setSelectedDiary({
          ...diary,
          content: modifiedHtml
        })
        setComments(diary?.comments)
        setComment('')
        setLoadingContent(false)
      })
    },
    [diaryList]
  )

  const handleClickModify = useCallback(() => {
    router.push(`/diary/update/${selectedDiary?.pk}`)
  }, [selectedDiary])

  const handleClickDelete = useCallback(async () => {
    const rowCount = await deleteDiary(selectedDiary)
    if (!rowCount) {
      toast.error('게시물 삭제 실패')
      return
    } else toast.success('게시물 삭제 성공')
    let _diaryList = [...diaryList]
    const idx = _diaryList.findIndex(
      (item: DiaryType) => item.pk === selectedDiary.pk
    )
    if (idx !== -1) {
      _diaryList.splice(idx, 1)
      if (_diaryList[0].pk !== undefined) handleClickDiary(_diaryList[0].pk)
      setConfirmDeleteDiaryModalOpen(false)
      setDiaryList(formatDiaryList(_diaryList))
    }
  }, [selectedDiary, diaryList])

  const handleChangeComment = useCallback((e: any) => {
    setComment(e.target.value)
  }, [])

  const handleCreateComment = useCallback(async () => {
    const rowCount = await createComment({
      content: comment,
      diaryPk: selectedDiary.pk
    })
    if (rowCount) {
      toast.success('작성 완료')
      handleClickDiary(selectedDiary.pk)
    }
  }, [comment, selectedDiary])

  const handleModifyComment = useCallback(async () => {
    if (!selectedComment || !selectedComment?.pk) return

    setModifyingComment(selectedComment)
    setComment(selectedComment.content)
  }, [selectedComment, comment])

  const submitModifiedComment = useCallback(async () => {
    if (!selectedComment || !selectedComment?.pk) return

    const result = await modifyComment({
      content: comment,
      commentPk: selectedComment.pk
    })
    if (result) {
      toast.success('수정 완료')
      setComment('')
      setModifyingComment(null)
      handleClickDiary(selectedDiary.pk)
    }
  }, [comment, selectedComment])

  const handleDeleteComment = useCallback(async () => {
    if (!selectedComment || !selectedComment?.pk) return

    const result = await deleteComment({ commentPk: selectedComment.pk })
    if (result) {
      toast.success('삭제 완료')
      handleClickDiary(selectedDiary.pk)
    }
  }, [selectedComment])

  const renderedContent = useMemo(() => {
    if (!selectedDiary?.content) return

    return (
      <Column dangerouslySetInnerHTML={{ __html: selectedDiary.content }} />
    )
  }, [selectedDiary?.content])

  const renderedDiaryList = useMemo(() => {
    if (!diaryList || !Array.isArray(diaryList)) return

    return (
      <>
        {isMobile && (
          <Box className={'absolute top-12 left-2 z-[10]'}>
            <IconButton onClick={() => setDiaryListDrawerOpen(true)}>
              <IconList color={'var(--color-foreground)'} />
            </IconButton>
          </Box>
        )}
        <Drawer
          open={diaryListDrawerOpen}
          onClose={() => setDiaryListDrawerOpen(false)}
          variant={!isMobile ? 'permanent' : 'temporary'}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              left: isMobile ? '0px' : '250px',
              overflow: 'hidden'
            }
          }}
        >
          <Column className={'w-full h-full'}>
            <Box
              sx={{
                width: 250,
                height: '100%'
              }}
              role='presentation'
            >
              <List>
                <PerfectScrollbar
                  options={{ wheelPropagation: false, suppressScrollX: true }}
                  className={'w-full max-h-screen pb-10'}
                >
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

                            await handleClickDiary(diary.pk)
                          }}
                        >
                          <Row
                            fullWidth
                            gap={1}
                            className={'justify-between items-center h-[50px]'}
                          >
                            <Typography variant={'subtitle2'}>
                              {dayjs(diary.date).get('date')}
                            </Typography>
                            <ListItemText
                              color={'var(--color-foreground)'}
                              className={'line-clamp-1'}
                              primary={diary.title}
                            />
                            {diary.thumbnail && (
                              <Image
                                src={diary.thumbnail}
                                alt={diary.title}
                                width={35}
                                height={35}
                                className={
                                  'object-cover rounded-md aspect-square'
                                }
                              />
                            )}
                          </Row>
                        </ListItemButton>
                      </ListItem>
                    </Fragment>
                  ))}
                </PerfectScrollbar>
              </List>
            </Box>
          </Column>
          <Box className={'absolute right-4 bottom-4'}>
            <button
              onClick={handleClickAdd}
              className={
                'bg-[#ddd] rounded-full p-1 shadow-lg z-[10] cursor-pointer'
              }
            >
              <IconPlus />
            </button>
          </Box>
        </Drawer>
      </>
    )
  }, [diaryList, diaryListDrawerOpen])

  return (
    <>
      <Box sx={{ display: 'flex', width: '100%' }}>
        {renderedDiaryList}

        <Column gap={10} fullWidth>
          {selectedDiary && (
            <Column fullWidth gap={4}>
              <Row
                fullWidth
                className={'rounded-lg bg-[var(--color-foreground)] px-4 py-2'}
              >
                <Typography className={'text-[var(--color-background)]'}>
                  {dayjs(selectedDiary.date).format('YYYY. M. D ddd A h:mm')}
                </Typography>
              </Row>
              <Column gap={4}>
                <Row className={'justify-between'}>
                  <Typography variant={'h5'}>{selectedDiary.title}</Typography>
                  <ModifyPopper
                    handleClickDelete={() =>
                      setConfirmDeleteDiaryModalOpen(true)
                    }
                    handleClickModify={handleClickModify}
                  />
                </Row>
                {
                  renderedContent ? renderedContent : <></>
                  //   TODO: skeleton
                }
              </Column>
            </Column>
          )}
          {loadingContent ? (
            <Column gap={1} fullWidth className={'mt-[-50px]'}>
              <Skeleton
                variant='rounded'
                className={'w-[95%] mr-[5%] min-h-[20px]'}
              />
              <Skeleton
                variant='rounded'
                className={'w-[95%] ml-[5%] min-h-[20px]'}
              />
              <Skeleton
                variant='rounded'
                className={'w-[85%] ml-[10%] mr-[5%] min-h-[20px]'}
              />
              <Skeleton
                variant='rounded'
                className={'w-[90%] min-h-[20px] mr-[10%]'}
              />
              <Skeleton
                variant='rounded'
                className={'w-[90%] ml-[5%] mr-[5%] min-h-[20px]'}
              />
            </Column>
          ) : (
            <Row fullWidth className={'relative'}>
              <TextField
                fullWidth
                multiline
                variant={'standard'}
                value={comment}
                onChange={handleChangeComment}
              />
              <Box>
                <IconButton
                  onClick={
                    !modifyingComment
                      ? handleCreateComment
                      : submitModifiedComment
                  }
                  disabled={comment === ''}
                >
                  <IconPencil />
                </IconButton>
              </Box>
            </Row>
          )}
          <Column fullWidth gap={4}>
            {comments.map((commentItem: CommentType, i: number) => {
              // 수정 중인 항목 가리기
              if (modifyingComment && modifyingComment.pk === commentItem.pk)
                return

              return (
                <Row key={i} fullWidth className={'justify-between'}>
                  <Column
                    fullWidth
                    gap={1}
                    className={
                      'min-h-[50px] border-l-[1px] px-6 py-2 border-[var(--color-foreground)]'
                    }
                  >
                    <Typography variant={'subtitle2'}>
                      {dayjs(commentItem?.createdAt).format('YYYY. M. D')}
                    </Typography>
                    <Typography sx={{ whiteSpace: 'pre-line' }}>
                      {commentItem.content}
                    </Typography>
                  </Column>
                  <ModifyPopper
                    onOpen={() => setSelectedComment(commentItem)}
                    handleClickDelete={handleDeleteComment}
                    handleClickModify={handleModifyComment}
                  />
                </Row>
              )
            })}
          </Column>
        </Column>
      </Box>

      <Dialog
        open={confirmDeleteDiaryModalOpen}
        onClose={() => setConfirmDeleteDiaryModalOpen(false)}
      >
        <DialogTitle>Diary를 삭제하시겠습니까?</DialogTitle>
        <DialogContent>
          <Row gap={2} fullWidth>
            <Button
              variant={'outlined'}
              color={'info'}
              className={'flex-[2]'}
              onClick={() => setConfirmDeleteDiaryModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant={'contained'}
              color={'error'}
              className={'flex-[1]'}
              onClick={handleClickDelete}
            >
              삭제
            </Button>
          </Row>
        </DialogContent>
      </Dialog>
    </>
  )
}
