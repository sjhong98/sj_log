import { Box } from '@mui/material'
import ContainerProps from '@/types/ContainerProps'

export default function Row({
  children,
  className,
  gap,
  fullWidth,
  ...rest
}: ContainerProps) {
  return (
    <Box
      className={`!flex ${className ?? ''} ${fullWidth && 'w-full'}`}
      sx={{ gap }}
      {...rest}
    >
      {children}
    </Box>
  )
}
