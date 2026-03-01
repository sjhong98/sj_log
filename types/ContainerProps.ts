import { ReactNode } from 'react'
import { BoxProps, SxProps, Theme } from '@mui/material'

interface ContainerProps extends BoxProps {
  children?: ReactNode
  gap?: number
  className?: string
  container?: boolean
  fullWidth?: boolean
  sx?: SxProps<Theme>
}

export default ContainerProps
