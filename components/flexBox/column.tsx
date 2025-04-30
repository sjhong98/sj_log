import { Box } from '@mui/material'
import ContainerProps from '@/types/ContainerProps'

export default function Column({
  children,
  className,
  gap,
  container,
  fullWidth,
  ...rest
}: ContainerProps) {
  return (
    <Box
      className={`!flex !flex-col ${className ?? ''} ${fullWidth && 'w-full'}`}
      sx={{ gap }}
      {...rest}
    >
      {children}
    </Box>
  )
}
