// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { isEmailAllowed } from '@/lib/permissions'

export default withAuth(
  function middleware(req) {
    // 获取用户邮箱
    const token = req.nextauth.token
    const email = token?.email as string | undefined

    // 检查邮箱权限（Edge Runtime 兼容）
    if (!isEmailAllowed(email)) {
      return NextResponse.redirect(new URL('/login?error=AccessDenied', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
