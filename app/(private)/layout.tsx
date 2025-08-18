import { getUser } from '@/actions/session/getUser'
import Header from '@/components/layouts/Header'
import MainSidebar from '@/components/layouts/MainSidebar'
import { Box } from '@mui/material'
import { ReactNode } from 'react'
import ClientLayout from './clientLayout'

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
          <ClientLayout>
            {children}
          </ClientLayout>
        </Box>
      </Box>
    </>
  )
}
