'use client'

import Column from '@/components/flexBox/column'
import { ChangeEvent, useCallback, useState } from 'react'
import DevLogType from '@/types/dev/DevLogType'
import Editor from '@/components/editor/Editor'

export default function Page() {
  const [formData, setFormData] = useState<DevLogType>({
    title: '',
    content: '',
    blocks: [],
    date: new Date()
  })

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let _formData = { ...formData }
      _formData[e.target.name as keyof DevLogType] = e.target.value
      setFormData(_formData)
    },
    [formData]
  )

  return (
    <>
      <Column gap={4} className={'w-full'}>
        <input
          name={'title'}
          value={formData.title}
          onChange={handleChange}
          placeholder={'Title'}
          autoComplete={'off'}
          className={
            'w-full !outline-none !text-[30px] ml-[52px] placeholder:text-[#aaa]'
          }
        />
        <Editor
          blocks={formData.blocks}
          setBlocks={(newBlocks: any) => {
            let _formData = { ...formData }
            _formData.blocks = newBlocks
            setFormData(_formData)
          }}
        />
      </Column>
    </>
  )
}
