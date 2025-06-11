// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/certificate'];

  // Define routes that should only be accessible to logged-out users
  const publicOnlyRoutes = ['/login', '/signup'];

  // ✅ REDIRECT LOGIC
  // If the user is not logged in and tries to access a protected route
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Redirect them to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If the user is logged in and tries to access login or signup pages
  if (user && publicOnlyRoutes.some(route => pathname.startsWith(route))) {
    // Redirect them to the dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}