'use client'

import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material'
import { useCallback, useState } from 'react'
import Column from '@/components/flexBox/column'
import { useRouter } from 'next/navigation'
import 'react-toastify/dist/ReactToastify.css'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { toast } from 'react-toastify'
import signIn from '../../../actions/session/signIn'

export default function Page() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginClicked, setLoginClicked] = useState<boolean>(false)

  const handleSignIn = useCallback(
    async (e: any) => {
      try {
        e.preventDefault()

        setLoginClicked(true)
  
        const result = await signIn({ email, password })
        console.log('login result: ', result)
        
        if (result.success && result.user) {
          toast.success('로그인 성공')
          // 클라이언트에서 사용할 정보만 저장
          sessionStorage.setItem('userId', email)
          console.log('user.email', result.user.email)
          router.push(`/dev/${result.user.email}`)
        } else {
          toast.error(result.error || '로그인에 실패했습니다.')
          setLoginClicked(false)
        }
      } catch (error) {
        console.error('로그인 오류: ', error)
        toast.error('로그인 중 오류가 발생했습니다.')
        setLoginClicked(false)
      }
    },
    [email, password]
  )

  return (
    <>
      <Box className={'overflow-hidden'}>
        <AuroraBackground>
          <Column gap={6} className={'items-center'}>
            <Box className={'w-full flex justify-center'}>
              <Typography variant={'h4'} className={'!font-dune dune'}>
                {!isMobile ? 'LIFE MANAGEMENT SYSTEM' : 'LMS'}
              </Typography>
            </Box>
            {/*  form 태그로 감싸고 onSubmit 이벤트 핸들러로 받기 */}
            {/*  -> 엔터 입력 등 이벤트를 모두 받을 수 있음  */}
            <Column
              component={'form'}
              gap={2}
              onSubmit={handleSignIn}
              className={'max-w-[500px] w-full'}
            >
              <TextField
                color={'primary'}
                label={'Email'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                fullWidth
                autoComplete='off'
              />
              <TextField
                color={'primary'}
                label={'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth
                type={'password'}
                autoComplete='off'
              />
              <Button
                title={'Sign In'}
                variant={'outlined'}
                fullWidth
                type={'submit'}
                color={'inherit'}
                disabled={loginClicked}
                className='h-10'
              >
                {loginClicked ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Column>
          </Column>
        </AuroraBackground>
      </Box>
    </>
  )
}
