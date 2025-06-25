'use client'

import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { useEffect } from 'react'
import { devLogType } from '@/types/schemaType'

export default function Editor({
  selectedDevLog,
  blocks,
  setBlocks
}: {
  selectedDevLog: devLogType | null
  blocks: any
  setBlocks: any
}) {
  const editor = useCreateBlockNote()

  const currentTheme = {
    colors: {
      editor: {
        text: '#ddd',
        background: '#050505'
      },
      menu: {
        text: '#ddd',
        background: '#151515'
      },
      tooltip: {
        text: '#ddd',
        background: '#151515'
      },
      hovered: {
        text: '#ddd',
        background: '#222'
      },
      selected: {
        text: '#ddd',
        background: '#151515'
      },
      disabled: {
        text: '#999',
        background: '#151515'
      },
      shadow: '#252525',
      border: '#151515',
      sideMenu: '#bababa',
      highlights: '#111'
    },
    borderRadius: 4,
    fontFamily: 'Helvetica Neue, sans-serif'
  }

  // 선택된 log 가 바뀌는 경우 -> block 갱신
  useEffect(() => {
    if (!selectedDevLog) return

    const _blocks = JSON.parse(selectedDevLog?.content ?? '')
    if (!_blocks || _blocks.length === 0) return

    const currentBlocks = editor.document

    // 새로운 block 삽입 후, 기존 blocks 삭제
    const initialBlockId = currentBlocks[0].id
    editor.insertBlocks(_blocks, initialBlockId, 'before')
    editor.removeBlocks([...currentBlocks.map((block: any) => block.id)])
  }, [selectedDevLog])

  // onChange 이벤틑 헨들러
  // 기존 값과 동일하지 않은 경우에만 상태 변경
  useEffect(() => {
    editor.onChange((editor, { getChanges }) => {
      const blocks = editor.document
      setBlocks((prev: any) => {
        const isEqual = JSON.stringify(prev) === JSON.stringify(blocks)
        return isEqual ? prev : blocks
      })
    })
  }, [setBlocks])

  return (
    <BlockNoteView
      editor={editor}
      className={'w-full z-[100]'}
      theme={{
        // @ts-ignore
        light: currentTheme,
        // @ts-ignore
        dark: currentTheme
      }}
    />
  )
}
