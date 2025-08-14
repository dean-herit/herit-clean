import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { verifyRefreshToken, revokeRefreshTokenFamily, clearAuthCookies } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('herit_refresh_token')?.value
    
    // If there's a refresh token, revoke the entire token family
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken)
      if (payload) {
        await revokeRefreshTokenFamily(payload.family)
        
        // Track successful logout
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'User logged out successfully',
          level: 'info',
          data: {
            userId: payload.userId,
            tokenFamily: payload.family,
          },
        })
      }
    }
    
    // Clear auth cookies
    await clearAuthCookies()
    
    // Clear Sentry user context
    Sentry.setUser(null)
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'logout',
        endpoint: '/api/auth/logout',
      },
    })
    
    // Still clear cookies even if there was an error
    await clearAuthCookies()
    Sentry.setUser(null)
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}