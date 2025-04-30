import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { accessToken, refreshToken } = body

  console.log('\n\n\nbody : ', body)

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
  }

  const cookieStore = await cookies()

  cookieStore.set('logToken', accessToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 30
  })

  return NextResponse.json({ success: true })
}
