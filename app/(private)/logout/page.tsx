'use client'

import signOut from "@/actions/session/signOut"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Page() {
    const router = useRouter()

    useEffect(() => {
        signOut().then(() => {
            router.push('/login')
        })
    }, [])

    return <></>
}