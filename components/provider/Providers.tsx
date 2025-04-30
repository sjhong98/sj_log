'use client'

import { ReactNode } from 'react'
import { createTheme, ThemeProvider } from '@mui/material'

const Providers = ({ children }: { children: ReactNode }) => {
  const darkTheme = createTheme({
    palette: {
      mode: 'dark'
    }
  })

  return (
    <>
      <ThemeProvider theme={darkTheme}>{children}</ThemeProvider>
    </>
  )
}

export default Providers
