import { ReactNode } from 'react'
import Column from '@/components/flexBox/column'
import Header from '@/components/layouts/Header'
import MainSidebar from '@/components/layouts/MainSidebar'
import { Box } from '@mui/material'
import { getUser } from '@/actions/session/getUser'

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getUser()
  return (
    <>
      <Box className={'flex p-6'}>
        <MainSidebar />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}
        >
          <Header user={user} />
          <Column className={'w-full items-center px-6 pt-4'}>
            {children}
          </Column>
        </Box>
      </Box>
    </>
  )
}
