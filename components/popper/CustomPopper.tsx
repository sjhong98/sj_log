import {
  ClickAwayListener,
  Fade,
  IconButton,
  Paper,
  Popper
} from '@mui/material'
import { IconDotsVertical } from '@tabler/icons-react'
import Row from '@/components/flexBox/row'
import { ReactNode, useRef, useState } from 'react'

const CustomPopper = ({
  buttons,
  onOpen,
  iconButtonClassName
}: {
  buttons: { icon: ReactNode; function: any }[]
  onOpen?: any
  iconButtonClassName?: string
}) => {
  const anchorRef = useRef<any>(null)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)

  return (
    <div>
      <IconButton
        className={iconButtonClassName}
        ref={anchorRef}
        onClick={() => {
          setHamburgerOpen(true)
          if (onOpen) onOpen()
        }}
      >
        <IconDotsVertical />
      </IconButton>
      <Popper
        open={hamburgerOpen}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1] p-2'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={'p-2'}>
              <ClickAwayListener onClickAway={e => setHamburgerOpen(false)}>
                <Row gap={1}>
                  {buttons.map((button, i) => {
                    return (
                      <IconButton
                        key={i}
                        onClick={button.function}
                        className={'group'}
                      >
                        {button.icon}
                      </IconButton>
                    )
                  })}
                </Row>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  )
}

export default CustomPopper
