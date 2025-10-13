'use client'

import Row from '@/components/flexBox/row'
import {
  Avatar,
  Badge,
  Button,
  ClickAwayListener,
  Divider,
  Fade,
  MenuList,
  Paper,
  Popper,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/auth-js'
import signOut from '../../actions/session/signOut'
import { toast } from 'react-toastify'

export default function Header({ user }: { user: User }) {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // States
  const [open, setOpen] = useState<boolean>(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: any, url?: string) => {
    if (url) {
      router.push(url)
    }

    if (
      anchorRef.current &&
      anchorRef.current.contains(event?.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      const result = await signOut()
      
      if (result.success) {
        // 클라이언트 쿠키와 세션 스토리지 정리
        sessionStorage.removeItem('userId')
        sessionStorage.removeItem('refreshToken')
        toast.success('로그아웃되었습니다.')
        router.push('/login')
      } else {
        toast.error(result.error || '로그아웃에 실패했습니다.')
      }
    } catch (error) {
      console.error('로그아웃 에러:', error)
      toast.error('로그아웃 중 오류가 발생했습니다.')
    }
  }

  return (
    <Row className={'w-full h-[50px] relative justify-center'}>
      <Typography variant={'h5'} className={'dune text-shadow-xl'}>
        {!isMobile ? 'LIFE MANAGEMENT SYSTEM' : 'LMS'}
      </Typography>
      <Row className={'absolute right-10'}>
        <Badge
          ref={anchorRef}
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          className='mis-2'
        >
          <Avatar
            ref={anchorRef}
            onClick={handleDropdownOpen}
            className='cursor-pointer bs-[38px] is-[38px]'
          />
        </Badge>
        <Popper
          open={open}
          transition
          disablePortal
          placement='bottom-end'
          anchorEl={anchorRef.current}
          className='min-is-[240px] !mbs-3 z-[1] p-2 min-w-[200px]'
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
                <ClickAwayListener
                  onClickAway={e =>
                    handleDropdownClose(e as MouseEvent | TouchEvent)
                  }
                >
                  <MenuList className={'flex flex-col gap-4'}>
                    <div
                      className='flex items-center plb-2 pli-6 gap-2'
                      tabIndex={-1}
                    >
                      <Avatar />
                      <Typography>{user?.email}</Typography>
                    </div>
                    <Divider className='mlb-1' />
                    <div className='flex items-center plb-2 pli-3'>
                      <Button
                        fullWidth
                        variant='contained'
                        color='error'
                        size='small'
                        endIcon={<i className='tabler-logout' />}
                        onClick={handleUserLogout}
                        sx={{
                          '& .MuiButton-endIcon': { marginInlineStart: 1.5 }
                        }}
                      >
                        로그아웃
                      </Button>
                    </div>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </Row>
    </Row>
  )
}
