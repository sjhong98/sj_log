import { getUser } from '@/actions/session/getUser'
import Header from '@/components/layouts/Header'
import AuthMainSidebarWrapper from '@/components/layouts/AuthMainSidebar'
import { Box } from '@mui/material'
import { ReactNode } from 'react'
import ClientLayout from './clientLayout'
import Row from '@/components/flexBox/row'

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getUser()
  return (
    <>
      <Box className='min-h-screen'>
        <AuthMainSidebarWrapper>
          <Row fullWidth>
            <div id='root-portal' />
            <Box className={'flex p-6 w-full overflow-visible'}>
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
          </Row>
        </AuthMainSidebarWrapper >
      </Box>
    </>
  )
}
