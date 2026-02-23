import { getUser } from "@/actions/session/getUser"

export default async function getPinnedDevLogList() {
    const user = await getUser()
    if (!user) return []

    const params = new URLSearchParams()
    params.set('uid', `eq.${user.id}`)
    params.set('is_pinned', 'eq.true')
    params.set('is_private', 'eq.false')
    params.set('limit', '10')
    params.set('order', 'updated_at.desc')

    const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log?${params.toString()}`, {
        headers: {
            'apikey': process.env.SUPABASE_KEY ?? '',
            'Authorization': `Bearer ${process.env.SUPABASE_KEY ?? ''}`
        },
    })

    const pinnedDevLogList = await result.json()
    return pinnedDevLogList
}