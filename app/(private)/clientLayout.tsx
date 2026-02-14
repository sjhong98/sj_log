'use client'

import Column from "@/components/flexBox/column"
import { useMediaQuery, useTheme } from "@mui/material"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const pathname = usePathname()

    const [overflow, setOverflow] = useState(false)

    useEffect(() => {
        if(pathname.includes('/dev')) {
            setOverflow(true)
            document.body.style.overflow = 'hidden'
        } else {
            setOverflow(false)
            document.body.style.overflow = 'auto'
        }

        // cleanup: 컴포넌트 언마운트 시 원래 상태로 복원
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [pathname])

    return (
        <Column className={`${isMobile ? 'w-full items-center px-0 pt-4' : 'w-full items-center px-6 pt-4'}`}>
            {children}
        </Column>
    )
}