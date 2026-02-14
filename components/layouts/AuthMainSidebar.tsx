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
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MenuProps {
  text: string
  route: string
}

const AuthMainSidebar = ({ user }: { user: User }) => {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const drawerWidth = collapsed ? 56 : 250

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
          width: !isMobile ? drawerWidth : 250,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: !isMobile ? drawerWidth : 250,
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen
            })
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          role='presentation'
        >
          {!isMobile && (
            <Box sx={{ p: 0.5, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
              <IconButton
                onClick={() => setCollapsed((c) => !c)}
                size="small"
                sx={{ color: 'var(--color-foreground)' }}
              >
                {collapsed ? (
                  <IconLayoutSidebarLeftExpand size={20} />
                ) : (
                  <IconLayoutSidebarLeftCollapse size={20} />
                )}
              </IconButton>
            </Box>
          )}
          {(!isMobile && !collapsed) || isMobile ? (
            <>
              <List sx={{ flex: 1 }}>
                {menu.map((menuItem) => (
                  <ListItem key={menuItem.text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        router.push(menuItem.route)
                      }}
                    >
                      <ListItemIcon />
                      <ListItemText primary={menuItem.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              <Divider />
            </>
          ) : null}
        </Box>
      </Drawer>
    </>
  )
}

export default AuthMainSidebar
