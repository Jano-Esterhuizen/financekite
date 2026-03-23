import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookies can't be set, middleware handles this
          }
        },
      },
    }
  )
}

/*
📘 Why two separate clients? In Next.js App Router, 
some code runs on the server (Server Components, Server Actions) and some on the client (browser). 
Supabase needs different implementations for each because the browser uses localStorage for session storage while the server uses cookies. 
Using the wrong client in the wrong context causes auth to break silently.
 */