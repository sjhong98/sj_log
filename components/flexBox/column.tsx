'use client'

import React, { HTMLAttributes, ReactNode } from 'react'

export interface ColumnProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  gap?: number
  fullWidth?: boolean
  container?: boolean
  component?: React.ElementType
}

export default function Column({
  children,
  className,
  gap,
  fullWidth,
  container: _container,
  style,
  component: Tag = 'div',
  ...rest
}: ColumnProps) {
  return (
    <Tag
      className={`!flex !flex-col ${className ?? ''} ${fullWidth ? 'w-full' : ''}`.trim()}
      style={{ gap: gap ?? undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
