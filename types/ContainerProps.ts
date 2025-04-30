import { ReactNode } from 'react'
import { BoxProps } from '@mui/material'

interface ContainerProps extends BoxProps {
  children?: ReactNode
  gap?: number
  className?: string
  container?: boolean
  fullWidth?: boolean
}

export default ContainerProps
