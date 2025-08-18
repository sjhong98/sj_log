'use client'

import Column from "@/components/flexBox/column"
import { useMediaQuery, useTheme } from "@mui/material"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <Column className={isMobile ? 'w-full items-center px-0 pt-4' : 'w-full items-center px-6 pt-4'}>
            {children}
        </Column>
    )
}