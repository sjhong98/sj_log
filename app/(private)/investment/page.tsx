'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    const userId = sessionStorage.getItem('userId')
    if (!userId) return

    router.push(`/investment/${userId}`)
  }, [])
3
  return <></>
}

export default Page
