import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')

  // If there's an error from the provider
  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`)
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      'https://rebfcchrzpfteambeurb.supabase.co',
      'sb_publishable_WqyKnQleMgQjt0YI45-xJw_L28_mvPO',
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
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Success - redirect to home
      const response = NextResponse.redirect(`${origin}${next}`)
      return response
    }
    
    // Code exchange failed, but try to check if session already exists
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData.session) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // No code or exchange failed - redirect to login
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
