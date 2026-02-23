import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

export default function useQueryString() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const addQueryString = useCallback(
        (name: string, value: string) => {
            // 호출 시점의 실제 URL 기준으로 병합 (스테일 클로저 방지)
            const currentSearch = typeof window !== 'undefined' ? window.location.search : searchParams.toString()
            const params = new URLSearchParams(currentSearch)
            params.set(name, value)

            router.push(pathname + '?' + params.toString())
        },
        [pathname, router, searchParams]
    )

    const removeQueryString = useCallback(
        (name: string) => {
            const currentSearch = typeof window !== 'undefined' ? window.location.search : searchParams.toString()
            const params = new URLSearchParams(currentSearch)
            params.delete(name)
            router.push(pathname + '?' + params.toString())
        },
        [pathname, router, searchParams]
    )

    const getQueryString = useCallback(
        (name: string) => {
            return searchParams.get(name)
        },
        [searchParams]
    )

    /** searchParams 전부 제거 (URL을 pathname만 남김) */
    const clearQueryString = useCallback(() => {
        if (searchParams.toString()) {
            router.replace(pathname)
        }
    }, [pathname, router, searchParams])

    return {
        addQueryString,
        removeQueryString,
        getQueryString,
        clearQueryString
    }
}