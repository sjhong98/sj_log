'use client'

import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Button as StatefulButton } from "@/components/ui/stateful-button"
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import {
  Box,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import signIn from '../../../actions/session/signIn'

export default function Page() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginClicked, setLoginClicked] = useState<boolean>(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'
    const gradientElem = document.getElementById('background-gradient-animation')
    if (gradientElem) gradientElem.classList.add('opacity-up-appear')
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  const handleSignIn = useCallback(
    async (e: any) => {
      try {
        e.preventDefault()

        setLoginClicked(true)

        const result = await signIn({ email, password })

        if (result.success && result.user) {
          toast.success('로그인 성공')
          // 클라이언트에서 사용할 정보만 저장
          sessionStorage.setItem('userId', email)
          router.push(`/dev/${result.user.email}`)
          return true
        } else {
          toast.error(result.error || '로그인에 실패했습니다.')
          setLoginClicked(false)
          return false
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
      <Column gap={3} className='w-screen max-h-screen overflow-hidden p-6'>
        <Row className={'w-full flex justify-center'}>
          <Typography variant={'h4'} className={'!font-dune dune'}>
            {!isMobile ? 'LIFE MANAGEMENT SYSTEM' : 'LMS'}
          </Typography>
        </Row>
        <Row gap={4} className='h-[calc(100vh-100px)]'>
          <Row
            id='background-gradient-animation'
            className='w-full h-full rounded-2xl overflow-hidden'
          >
            <BackgroundGradientAnimation className='h-full' />
          </Row>
          <Column
            id='login-form'
            fullWidth
            component={'form'}
            gap={4}
            onSubmit={handleSignIn}
            className={'max-w-[300px] w-full items-center justify-center'}
          >
            <p>Login</p>
            <Column fullWidth gap={2}>
              <PlaceholdersAndVanishInput
                placeholders={['Email']}
                onChange={e => setEmail(e.target.value)}
              />
              <PlaceholdersAndVanishInput
                placeholders={['Password']}
                onChange={e => setPassword(e.target.value)}
                type={'password'}
              />
            </Column>
            <StatefulButton type='submit' className='z-[9999] w-full' onClick={handleSignIn}>
              Sign In
            </StatefulButton>
          </Column>
        </Row>
        <Column>
        </Column>
      </Column>
    </>
  )
}

