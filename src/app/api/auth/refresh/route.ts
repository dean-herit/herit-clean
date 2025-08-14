import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { refreshTokenRotation } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('herit_refresh_token')?.value
    
    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No refresh token provided' 
        },
        { status: 401 }
      )
    }
    
    // Attempt token rotation
    const result = await refreshTokenRotation(refreshToken)
    
    if (!result) {
      // Clear invalid cookies
      cookieStore.delete('herit_access_token')
      cookieStore.delete('herit_refresh_token')
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired refresh token' 
        },
        { status: 401 }
      )
    }
    
    const { accessToken, refreshToken: newRefreshToken, user } = result
    
    // Set new cookies
    cookieStore.set('herit_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })
    
    cookieStore.set('herit_refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })
    
    // Update Sentry user context
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: `${user.firstName} ${user.lastName}`.trim() || user.email,
    })
    
    // Track successful token refresh
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Tokens refreshed successfully',
      level: 'info',
      data: {
        userId: user.id,
        email: user.email,
      },
    })
    
    return NextResponse.json({
      success: true,
      user,
    })
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'refresh',
        endpoint: '/api/auth/refresh',
      },
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred' 
      },
      { status: 500 }
    )
  }
}