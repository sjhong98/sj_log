import { ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'
import Column from '@/components/flexBox/column'
import Row from '@/components/flexBox/row'

export default function DashboardContainer({
  children,
  title,
  xs,
  md,
  mh,
  action
}: {
  children?: ReactNode
  title?: string
  xs?: number
  md?: number
  mh?: number
  action?: ReactNode
}) {
  return (
    <Grid
      size={{ xs: xs ?? 4, md: md ?? 4 }}
      className={'rounded-lg bg-[#111] px-6 py-3'}
      sx={{ minHeight: `${mh ?? 0}px` }}
    >
      <Column gap={2}>
        {(title || action) && (
          <Row className={'w-full justify-between relative'}>
            {title && <Typography className={'font2'}>{title}</Typography>}
            {action}
          </Row>
        )}
        {children}
      </Column>
    </Grid>
  )
}
