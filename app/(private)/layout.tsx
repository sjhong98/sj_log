import { getUser } from '@/actions/session/getUser'
import Column from '@/components/flexBox/column'
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
          <div id="root-portal" />
          <Column className={'overflow-visible p-[var(--content-inner-padding)]'}>
            <Header user={user} />
            <Column className="w-full items-center md:px-6 px-0 relative">{children}</Column>
          </Column>
        </AuthMainSidebarWrapper>
      </Box>
    </>
  )
}
