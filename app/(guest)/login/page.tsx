'use client'

import {
  Box,
  Button,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useCallback, useState } from 'react'
import Column from '@/components/flexBox/column'
import useAuth from '@/hooks/auth'
import { useRouter } from 'next/navigation'
import 'react-toastify/dist/ReactToastify.css'
import { AuroraBackground } from '@/components/ui/aurora-background'

export default function Page() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const auth = useAuth()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleSignIn = useCallback(
    async (e: any) => {
      e.preventDefault()

      const user = await auth.signIn({ email, password })
      if (!user) return

      console.log(user)

      router.push(`/diary/${user.email}`)
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
              >
                Sign In
              </Button>
            </Column>
          </Column>
        </AuroraBackground>
      </Box>
    </>
  )
}
