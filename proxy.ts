import { updateSession } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Skip middleware entirely for Server Actions (POST requests with Next-Action header)
  // Server Actions handle their own auth via the action function
  const isServerAction = request.method === 'POST' && request.headers.get('next-action')
  if (isServerAction) {
    return NextResponse.next()
  }

  // Skip middleware for API routes (they handle auth separately)
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
