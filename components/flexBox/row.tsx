import { HTMLAttributes, ReactNode } from 'react'

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  gap?: number
  fullWidth?: boolean
}

export default function Row({ children, className, gap, fullWidth, style, ...rest }: RowProps) {
  return (
    <div
      className={`!flex ${className ?? ''} ${fullWidth ? 'w-full' : ''}`.trim()}
      style={{ gap: gap ?? undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
