'use client'

import Row from '@/components/flexBox/row'
import {
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { User } from '@supabase/auth-js'

export default function Header({ user }: { user: User }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Row id='header' className={'w-full h-[50px] relative justify-center'}>
      <Typography variant={'h5'} className={'dune text-shadow-xl'}>
        {!isMobile ? 'LIFE MANAGEMENT SYSTEM' : 'LMS'}
      </Typography>
    </Row>
  )
}
