import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
/*
📘 Why a callback route? When a user clicks "Log in with Google", Supabase redirects them to Google's auth page. 
After Google authenticates the user, it redirects back to your app at /auth/callback?code=xxx. 
This route exchanges that code for a real session and then redirects to the dashboard. 
Without this route, Google OAuth would fail silently./*


if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
*/