import { NextRequest, NextResponse } from 'next/server'
import { checkSession } from '@/actions/session/checkSession'

export default async function middleware(request: NextRequest) {
  const user = await checkSession()
  const response = NextResponse.next()

  // x-url 헤더에 현재 요청 URL 설정
  response.headers.set('x-url', request.url)

  if (user?.newSession) {
    // console.log('\nSession Refreshed')
    response.cookies.set('logToken', user.newSession?.newAccessToken ?? '')
    response.cookies.set('refreshToken', user.newSession?.newRefreshToken ?? '')

    // console.log(
    //   '\n\n\nToken Updated at Middleware : \n',
    //   user.newSession,
    //   '\n\n\n'
    // )
    return response
  } else if (user) {
    // console.log('\nSession Exist')
  } else if (!user) {
    // console.log('\nFailed to refresh session')
    // return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/diary/:path*', '/finance/:path*', '/dev/:path*']
}
