import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  // Debug: log what we received
  console.log('=== AUTH CALLBACK ===')
  console.log('URL:', request.url)
  console.log('Code:', code ? 'present' : 'missing')
  console.log('Error param:', errorParam || 'none')
  console.log('All params:', Object.fromEntries(searchParams.entries()))

  // If Google returned an error
  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=google_${errorParam}`)
  }

  // No code at all
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code&url=${encodeURIComponent(request.url)}`)
  }

  try {
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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('Exchange result - Error:', error?.message || 'none')
    console.log('Exchange result - User:', data?.user?.email || 'none')
    console.log('Exchange result - Session:', data?.session ? 'present' : 'missing')

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=exchange&msg=${encodeURIComponent(error.message)}`)
    }

    if (data.session) {
      return NextResponse.redirect(`${origin}/`)
    }

    // Code exchanged but no session
    return NextResponse.redirect(`${origin}/login?error=no_session`)
  } catch (err: any) {
    console.log('Exception:', err.message)
    return NextResponse.redirect(`${origin}/login?error=exception&msg=${encodeURIComponent(err.message)}`)
  }
}
