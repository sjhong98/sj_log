import { getUser } from '@/actions/session/getUser'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'
import AuthMainSidebarWrapper from '@/components/layouts/AuthMainSidebar'
import Header from '@/components/layouts/Header'
import { Box } from '@mui/material'
import { ReactNode } from 'react'

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await getUser()
  return (
    <>
      <Box className="min-h-screen">
        <AuthMainSidebarWrapper>
          <Row fullWidth>
            <div id="root-portal" />
            <Column fullWidth className={'overflow-visible'}>
              <Header user={user} />
              <Column fullWidth className="w-full h-[var(--inner-content-height)] items-center md:px-6 px-0 relative">
                {children}
              </Column>
            </Column>
          </Row>
        </AuthMainSidebarWrapper>
      </Box>
    </>
  )
}
