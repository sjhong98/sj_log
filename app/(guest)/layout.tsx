import { ReactNode } from 'react'
import Column from '@/components/flexBox/column'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Column className={'w-full items-center gap-10'}>{children}</Column>
    </>
  )
}
