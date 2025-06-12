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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconLayoutSidebarLeftExpand } from '@tabler/icons-react'

interface MenuProps {
  text: string
  route: string
}

const MainSidebar = () => {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
    }
  ]

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

export default MainSidebar
