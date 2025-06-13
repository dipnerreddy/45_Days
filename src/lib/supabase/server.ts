// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'


// This function is now simplified. It just passes the cookie store handlers
// directly to the Supabase client. The client itself will handle the async nature.
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // The `set` and `remove` methods are not strictly needed for read-only
        // server components, but it's good practice to include them for
        // server actions or other scenarios.
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // This can happen if you try to set a cookie from a Server Component.
            // It's safe to ignore in many cases.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // This can happen if you try to delete a cookie from a Server Component.
          }
        },
      },
    }
  )
}