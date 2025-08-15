import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Check for OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=oauth_error', request.url))
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=missing_code', request.url))
    }
    
    // Verify state parameter
    const storedState = request.cookies.get('oauth_state')?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url))
    }
    
    // Exchange code for tokens (trim to prevent newline issues)
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback').trim()
    
    if (!googleClientId || !googleClientSecret) {
      return NextResponse.redirect(new URL('/login?error=oauth_config', request.url))
    }
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    
    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/login?error=token_exchange', request.url))
    }
    
    const tokens = await tokenResponse.json()
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })
    
    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text())
      return NextResponse.redirect(new URL('/login?error=user_info', request.url))
    }
    
    const googleUser = await userResponse.json()
    
    // Check if user exists in database or create them
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) {
      return NextResponse.redirect(new URL('/login?error=session_config', request.url))
    }
    
    // For now, create a simple access token with the user info
    // In a full implementation, you'd want to create/update the user in the database
    const secret = new TextEncoder().encode(sessionSecret)
    const sessionVersion = Date.now()
    
    const accessToken = await new SignJWT({
      userId: `google_${googleUser.id}`, // Prefix to distinguish OAuth users
      email: googleUser.email,
      sessionVersion,
      type: 'access'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // Match existing auth system
      .sign(secret)
    
    // Check if user needs onboarding (OAuth users always start with onboarding)
    // Since this is a new OAuth user, redirect to onboarding
    const redirectUrl = '/onboarding' // OAuth users need onboarding
    
    // Set auth cookies using the existing system's cookie names
    const response = NextResponse.redirect(new URL(redirectUrl, request.url))
    
    response.cookies.set('herit_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })
    
    // Clear state cookie
    response.cookies.delete('oauth_state')
    
    return response
    
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(new URL('/login?error=callback_error', request.url))
  }
}