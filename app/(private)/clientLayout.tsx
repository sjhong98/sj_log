'use client'

import Column from "@/components/flexBox/column"
import { useMediaQuery, useTheme } from "@mui/material"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const pathname = usePathname()

    const [overflow, setOverflow] = useState(false)

    useEffect(() => {
        if(pathname.includes('/dev')) setOverflow(true)
        else setOverflow(false)
    }, [pathname])

    return (
        <Column className={`${isMobile ? 'w-full items-center px-0 pt-4' : 'w-full items-center px-6 pt-4'} ${overflow ? 'overflow-hidden' : 'overflow-auto'}`}>
            {children}
        </Column>
    )
}