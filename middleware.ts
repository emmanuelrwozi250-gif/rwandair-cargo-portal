import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Authenticated areas. Everything else is public; unknown paths fall through
// to Next (which 404s if there's no page) rather than redirecting to login.
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/capacity']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are not configured, still protect authenticated areas
  if (!url || !key) {
    if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
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

  // Public API routes (everything the public site posts to / reads from)
  if (
    pathname.startsWith('/api/webhook') ||
    pathname.startsWith('/api/quote') ||
    pathname.startsWith('/api/track') ||
    pathname.startsWith('/api/capacity') ||
    pathname.startsWith('/api/claims') ||
    pathname.startsWith('/api/rate') ||
    pathname.startsWith('/api/reviews') ||
    pathname.startsWith('/api/nps') ||
    pathname.startsWith('/api/feedback') ||
    pathname.startsWith('/api/feature-requests') ||
    pathname.startsWith('/api/news') ||
    pathname.startsWith('/api/articles') ||
    pathname.startsWith('/api/charter') ||
    pathname.startsWith('/api/cron')
  ) {
    return supabaseResponse
  }

  // Signed-in users skip the login/register pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    return NextResponse.redirect(
      new URL(userData?.role === 'admin' ? '/admin/revenue' : '/dashboard', request.url)
    )
  }

  // Protected areas — exporter dashboard, admin, and the capacity marketplace
  if (PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    if (!user) {
      const login = new URL('/login', request.url)
      if (pathname.startsWith('/capacity')) login.searchParams.set('redirect', pathname)
      return NextResponse.redirect(login)
    }
    if (pathname.startsWith('/admin')) {
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  // Public + unknown paths fall through (unknown → Next 404)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
