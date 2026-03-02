'use client'

import React, { HTMLAttributes, ReactNode } from 'react'

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  gap?: number
  fullWidth?: boolean
  component?: React.ElementType
}

export default function Row({
  children,
  className,
  gap,
  fullWidth,
  style,
  component: Tag = 'div',
  ...rest
}: RowProps) {
  return (
    <Tag
      className={`!flex ${className ?? ''} ${fullWidth ? 'w-full' : ''}`.trim()}
      style={{ gap: gap ?? undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
