import { HTMLAttributes, ReactNode } from 'react'

export interface ColumnProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  gap?: number
  fullWidth?: boolean
  container?: boolean
}

export default function Column({
  children,
  className,
  gap,
  fullWidth,
  container: _container,
  style,
  ...rest
}: ColumnProps) {
  return (
    <div
      className={`!flex !flex-col ${className ?? ''} ${fullWidth ? 'w-full' : ''}`.trim()}
      style={{ gap: gap ?? undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  )
}
