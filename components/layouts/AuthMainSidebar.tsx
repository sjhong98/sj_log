'use client'

import {
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
import { IconLayoutSidebarLeftExpand } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default AuthMainSidebar
