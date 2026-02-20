'use client'

import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core'
import { useEffect } from 'react'
import { devLogType } from '@/types/schemaType'
import { useMediaQuery, useTheme } from '@mui/material'
import { createHighlighter } from "../../shiki.bundle";
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'


export default function Editor({
  id,
  selectedDevLog,
  blocks,
  setBlocks,
  disabled,
  setBlockInitializing
}: {
  id: number
  selectedDevLog: devLogType | null
  blocks: any
  setBlocks: any
  disabled: boolean
  setBlockInitializing: any
}) {
  const editor = useCreateBlockNote({
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        codeBlock: createCodeBlockSpec({
          indentLineWithTab: true,
          defaultLanguage: "typescript",
          supportedLanguages: {
            typescript: {
              name: "TypeScript",
              aliases: ["ts"],
            },
            javascript: {
              name: "JavaScript",
              aliases: ["js"],
            },
            react: {
              name: "React",
              aliases: ["react"],
            },
            jsx: {
              name: "JSX",
              aliases: ["jsx"],
            }
          },
          createHighlighter: () =>
            createHighlighter({
              themes: ["dark-plus", "light-plus"],
              langs: [],
            }) as any,
        }),
      },
    }),
  })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const currentTheme = {
    colors: {
      editor: {
        text: '#ddd',
        background: '#000'
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
    fontFamily: 'Helvetica Neue, sans-serif',
    paddingLeft: 0,
  }

  // 선택된 log 가 바뀌는 경우 -> block 갱신
  useEffect(() => {
    if (!selectedDevLog) return

    // setBlockInitializing(true)

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
      editable={!disabled}
      className={`z-[3] md:w-full w-[calc(100%+60px)] md:ml-0 ml-[-30px]`}
      theme={{
        // @ts-ignore
        light: currentTheme,
        // @ts-ignore
        dark: currentTheme
      }}
    />
  )
}
