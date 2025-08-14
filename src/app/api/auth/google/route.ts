import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Trim whitespace to prevent newline issues
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback').trim()
    
    if (!googleClientId) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured' },
        { status: 500 }
      )
    }


    // Generate state parameter for security
    const state = crypto.randomUUID()
    
    // Store state in a cookie for verification
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/auth?` +
      `client_id=${encodeURIComponent(googleClientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `state=${encodeURIComponent(state)}`
    )
    
    // Set state cookie
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Google OAuth' },
      { status: 500 }
    )
  }
}