import { NextRequest, NextResponse } from 'next/server'
import { checkSession } from '@/actions/session/checkSession'

export default async function middleware(request: NextRequest) {
  const user = await checkSession()

  if (user?.newSession) {
    console.log('\nSession Refreshed')
    const response = NextResponse.next()
    response.cookies.set('logToken', user.newSession?.newAccessToken ?? '')
    response.cookies.set('refreshToken', user.newSession?.newRefreshToken ?? '')

    console.log(
      '\n\n\nToken Updated at Middleware : \n',
      user.newSession,
      '\n\n\n'
    )
    return response
  } else if (user) {
    console.log('\nSession Exist')
  } else if (!user) {
    console.log('\nFailed to refresh session')
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/diary/:path*', '/finance/:path*']
}
