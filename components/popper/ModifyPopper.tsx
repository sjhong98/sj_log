import {
  ClickAwayListener,
  Fade,
  IconButton,
  Paper,
  Popper
} from '@mui/material'
import Row from '@/components/flexBox/row'
import {
  IconDotsVertical,
  IconPencil,
  IconTrashFilled
} from '@tabler/icons-react'
import { useRef, useState } from 'react'

const ModifyPopper = ({
  onOpen,
  handleClickDelete,
  handleClickModify
}: {
  onOpen?: any
  handleClickDelete: any
  handleClickModify: any
}) => {
  const anchorRef = useRef<any>(null)
  const [hamburgerOpen, setHamburgerOpen] = useState(false)
  return (
    <div>
      <IconButton
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
                  <IconButton
                    onClick={() => {
                      setHamburgerOpen(false)
                      handleClickDelete()
                    }}
                    className={'group'}
                  >
                    <IconTrashFilled
                      className={'group-hover:text-red-500 duration-100'}
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setHamburgerOpen(false)
                      handleClickModify()
                    }}
                    className={'group'}
                  >
                    <IconPencil
                      className={'group-hover:text-amber-500 duration-100'}
                    />
                  </IconButton>
                </Row>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  )
}

export default ModifyPopper
