import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that are always public — no auth required
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/quote',
  '/consolidate',
  '/perishables',
  '/stations',
  '/globe',
  '/track',
  '/agents',
  '/agent',
  '/integrations',
  '/api-docs',
  '/claims',
  '/rate',
  '/reviews',
  '/feedback',
]

// Public route prefixes (dynamic segments)
const PUBLIC_PREFIXES = ['/products', '/track', '/legal', '/news', '/agents/register']

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are not configured, still protect admin/dashboard routes
  if (!url || !key) {
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Allow tracking pages publicly: /track/[awb]
  if (pathname.startsWith('/track')) {
    return supabaseResponse
  }

  // Allow webhook and public API routes
  if (
    pathname.startsWith('/api/webhook') ||
    pathname.startsWith('/api/quote') ||
    pathname.startsWith('/api/track') ||
    pathname.startsWith('/api/capacity') ||
    pathname.startsWith('/api/agents') ||
    pathname.startsWith('/api/agent') ||
    pathname.startsWith('/api/claims') ||
    pathname.startsWith('/api/rate') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/nps') ||
    pathname.startsWith('/api/feedback') ||
    pathname.startsWith('/api/feature-requests') ||
    pathname.startsWith('/api/news') ||
    pathname.startsWith('/api/articles') ||
    pathname.startsWith('/api/cron')
  ) {
    return supabaseResponse
  }

  // Agent-only marketplace pages — require a signed-in account, bounce to portal login
  if (pathname.startsWith('/capacity') || pathname.startsWith('/deals')) {
    if (!user) {
      const url = new URL('/portal/login', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Agent portal — its own auth surface, separate from the exporter /login
  if (pathname.startsWith('/portal')) {
    if (pathname === '/portal/login') {
      if (user) return NextResponse.redirect(new URL('/portal/dashboard', request.url))
      return supabaseResponse
    }
    if (!user) return NextResponse.redirect(new URL('/portal/login', request.url))
    return supabaseResponse
  }

  // Public routes — always accessible
  if (PUBLIC_ROUTES.some(r => pathname === r) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    // Redirect logged-in users away from login/register
    if (user && (pathname === '/login' || pathname === '/register')) {
      const { data: userData } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (userData?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/revenue', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Protected routes — require authentication
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  const role = userData?.role

  // Admin revenue dashboard — admin only
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
