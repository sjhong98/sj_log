import Row from '@/components/flexBox/row'
import { useState } from 'react'
import { Box, Tooltip } from '@mui/material'

interface listType {
  title: string
  text?: string
  icon?: any
}

interface itemType extends listType {
  selected: boolean
  onClick: any
  itemDirection: any
  onlyIcon: any
}

export default function CustomRadio({
  name,
  list,
  onChange,
  itemDirection,
  onlyIcon,
  wrap,
  etc,
  onEtcChange,
  direction
}: {
  name?: string
  list: listType[]
  onChange: any
  itemDirection?: 'vertical' | 'horizontal'
  onlyIcon?: boolean
  wrap?: boolean
  etc?: boolean
  onEtcChange?: any
  direction?: 'vertical' | 'horizontal'
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [etcKeyword, setEtcKeyword] = useState<string>('')
  const handleClick = (index: number) => {
    setSelected(index)
    if (onChange) {
      onChange({
        target: {
          value: list[index].title,
          name
        }
      })
    }
  }
  const handleChangeEtc = (e: any) => {
    setEtcKeyword(e.target.value)
    if (onEtcChange)
      onEtcChange({
        target: {
          value: e.target.value,
          name
        }
      })
  }
  return (
    <>
      <Box
        className={`flex gap-4 p-2 ${wrap && 'flex-wrap'} ${direction === 'vertical' && 'flex-col'}`}
      >
        {list.map((item, i) => {
          return (
            <Row
              key={i}
              style={
                direction !== 'vertical'
                  ? { width: `${100 / list.length}%` }
                  : {}
              }
            >
              <RadioItem
                onlyIcon={onlyIcon}
                itemDirection={itemDirection}
                title={item.title}
                icon={item.icon}
                selected={selected === i}
                onClick={() => handleClick(i)}
              />
            </Row>
          )
        })}
        {etc !== false &&
          selected !== null &&
          list[selected].title === 'etc' && (
            <Row
              className={
                'relative rounded-md border-[2px] border-[#222] px-4 py-2 focus-within:border-[#dadada] duration-75'
              }
            >
              <input
                name={'etc'}
                placeholder={'etc.'}
                className={'w-full outline-none !text-2xl text-end mr-1'}
                value={etcKeyword}
                onChange={handleChangeEtc}
                autoComplete='off'
              />
            </Row>
          )}
      </Box>
    </>
  )
}

function RadioItem({
  title,
  icon,
  selected,
  onClick,
  itemDirection,
  onlyIcon
}: itemType) {
  return (
    <>
      <Tooltip
        title={title}
        className={'uppercase'}
        disableHoverListener={onlyIcon !== true}
        disableInteractive
      >
        <Box
          onClick={onClick}
          sx={{
            display: 'flex',
            flexDirection: itemDirection === 'horizontal' ? 'row' : 'column'
          }}
          className={`w-full gap-1 cursor-pointer rounded-md px-4 py-3 border-[2px] border-[#222] ${selected ? 'border-[var(--color-foreground)]' : ''} hover:bg-[#222] duration-75`}
        >
          {icon && (
            <Row
              fullWidth
              className={`justify-center ${onlyIcon && 'scale-[1.2]'}`}
            >
              {icon}
            </Row>
          )}
          {onlyIcon !== true && (
            <Row fullWidth className={'justify-center uppercase'}>
              {title}
            </Row>
          )}
        </Box>
      </Tooltip>
    </>
  )
}
