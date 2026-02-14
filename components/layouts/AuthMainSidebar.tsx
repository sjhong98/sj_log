'use client'

import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { User } from '@supabase/supabase-js'
import { IconChartCandle, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { IconNotebook, IconCode, IconBrandCashapp, IconUser, IconChartLine } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import useUser from '@/hooks/useUser'

interface MenuProps {
  text: string
  route: string
}

const AuthMainSidebar = ({ user }: { user: User }) => {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(false)

  const drawerWidth = 250

  const menu: MenuProps[] = [
    {
      text: 'Diary',
      route: `/diary`
    },
    {
      text: 'Finance',
      route: `/finance`
    },
    {
      text: 'Dev Blog',
      route: `/dev`
    },
    {
      text: 'Names',
      route: `/names`
    },
    {
      text: 'Investment',
      route: `/investment`
    }
  ]

  if (!user) return null

  return (
    <>
      {isMobile && (
        <Box className={'absolute left-2 top-4 z-[10]'}>
          <IconButton onClick={() => setOpen(true)}>
            <IconLayoutSidebarLeftExpand color={'var(--color-foreground)'} />
          </IconButton>
        </Box>
      )}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        variant={!isMobile ? 'permanent' : 'temporary'}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflow: 'hidden'
          }
        }}
      >
        <Box
          sx={{
            width: 250,
            height: '100%'
          }}
          role='presentation'
        >
          <List>
            {menu.map((menuItem, index) => (
              <ListItem key={menuItem.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    router.push(menuItem.route)
                  }}
                >
                  <ListItemIcon>
                    {/*{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}*/}
                  </ListItemIcon>
                  <ListItemText primary={menuItem.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Box>
      </Drawer>
    </>
  )
}

const AuthMainSidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser()
  const [open, setOpen] = useState(false)

  const links = [
    {
      label: 'Diary',
      href: `/diary`,
      icon: (
        <IconNotebook className="h-5 w-5 shrink-0 text-neutral-200" />
      )
    },
    {
      label: 'Finance',
      href: `/finance`,
      icon: (
        <IconBrandCashapp className="h-5 w-5 shrink-0 text-neutral-200" />
      )
    },
    {
      label: 'Dev Blog',
      href: `/dev`,
      icon: (
        <IconCode className="h-5 w-5 shrink-0 text-neutral-200" />
      )
    },
    {
      label: 'Names',
      href: `/names`,
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-200" />
      )
    },
    {
      label: 'Investment',
      href: `/investment`,
      icon: (
        <IconChartLine className="h-5 w-5 shrink-0 text-neutral-200" />
      )
    }
  ]

  return (
    <div
      className={cn(
        "mx-auto flex w-full h-screen flex-1 flex-col overflow-hidden md:flex-row bg-transparent",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <>
              {/* <Logo /> */}
            </>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: (user && user.email) ? user.email : '로그인',
                href: user ? '#' : '/login',
                icon: (
                  <Avatar
                    className='cursor-pointer bs-[30px] is-[30px]'
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className='w-full h-screen overflow-hidden bg-neutral-900 md:p-2 p-0'>
        <div className='w-full h-full md:rounded-2xl rounded-none overflow-hidden bg-black'>
          {children}
        </div>
      </div>
    </div>
  )

}

export default AuthMainSidebarWrapper
