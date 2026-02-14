'use client'

import { UserProvider } from '@/context/UserContext'
import { ReactNode } from 'react'
import { createTheme, ThemeProvider } from '@mui/material'

const Providers = ({ children }: { children: ReactNode }) => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark'
    }
  })

  return (
    <ThemeProvider theme={darkTheme}>
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  )
}

export default Providers
