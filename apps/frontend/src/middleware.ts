import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

export async function middleware(request: NextRequest) {
  // /admin 以下のパスに対してのみ実行
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await auth()

    // 管理者でない場合はトップページにリダイレクト
    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

// /admin 以下のパスに対してのみミドルウェアを実行
export const config = {
  matcher: '/admin/:path*',
} 