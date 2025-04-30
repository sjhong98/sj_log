'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    const userId = sessionStorage.getItem('userId')
    if (!userId) return

    router.push(`/diary/${userId}`)
  }, [])

  return <></>
}

export default Page
