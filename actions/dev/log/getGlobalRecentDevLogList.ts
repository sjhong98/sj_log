'use server'

const getGlobalRecentDevLogList = async () => {
    const params = new URLSearchParams()
    params.set('select', '*,nickname:user(nickname)')
    params.set('is_private', 'eq.false')
    params.set('limit', '10')
    params.set('order', 'updated_at.desc')

    const result = await fetch(`${process.env.SUPABASE_REST_URL}/dev_log?${params.toString()}`, {
        headers: {
            'apikey': process.env.SUPABASE_KEY ?? '',
            'Authorization': `Bearer ${process.env.SUPABASE_KEY ?? ''}`
        },
        cache: 'force-cache',
        next: {
            tags: ['dev-log']
        }
    })

    const devLogList = await result.json()
    return devLogList
}

export default getGlobalRecentDevLogList