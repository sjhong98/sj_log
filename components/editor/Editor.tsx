'use client'

import '@blocknote/core/fonts/inter.css'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'
import { useCreateBlockNote } from '@blocknote/react'
import { useEffect } from 'react'

export default function Editor({
  blocks,
  setBlocks
}: {
  blocks: any
  setBlocks: any
}) {
  const editor = useCreateBlockNote({})

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

  useEffect(() => {
    editor.onChange((editor, { getChanges }) => {
      const blocks = editor.document
      setBlocks(blocks)
    })
  }, [setBlocks])

  return (
    <BlockNoteView
      editor={editor}
      className={'w-full z-[2000]'}
      theme={{
        // @ts-ignore
        light: currentTheme,
        // @ts-ignore
        dark: currentTheme
      }}
    />
  )
}
