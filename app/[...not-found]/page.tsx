import Column from '@/components/flexBox/column'
import { Typography } from '@mui/material'

export default function NotFoundPage() {
  return (
    <Column className={'w-full h-screen items-center justify-center'}>
      <Typography variant={'h2'} className={'dune'}>
        LIFE MANAGEMENT SYSTEM
      </Typography>
      <Typography variant={'h5'}>페이지를 찾을 수 없습니다</Typography>
    </Column>
  )
}
