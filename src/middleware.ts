import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED_ROUTES = ['/dashboard', '/post-listing', '/saved']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth_token')?.value
  const user = token ? verifyToken(token) : null

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some(r => pathname.startsWith(r)) && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect user routes
  if (PROTECTED_ROUTES.some(r => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url))
  }

  // Protect admin routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
