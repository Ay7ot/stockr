import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Auth cookie name patterns for Supabase
const AUTH_COOKIE_PREFIX = 'sb-'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Protected routes - only check auth for these
  const protectedRoutes = ['/dashboard', '/products', '/sales', '/reports', '/analytics', '/activity', '/staff', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Skip auth check entirely for unprotected routes (that aren't login)
  if (!isProtectedRoute && !isLoginPage) {
    return supabaseResponse
  }

  // Quick check: if no auth cookies present, user is not logged in
  const cookies = request.cookies.getAll()
  const hasAuthCookie = cookies.some(c => c.name.startsWith(AUTH_COOKIE_PREFIX))

  // If no auth cookie on protected route, redirect immediately (no network call)
  if (isProtectedRoute && !hasAuthCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If no auth cookie on login page, just show login (no need to redirect)
  if (isLoginPage && !hasAuthCookie) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and setup.stateChange
  // as any single error would stop the client from being established

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and tries to access login page, redirect to dashboard
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
