import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/auth'

/**
 * Test login endpoint for development
 * This creates a test session without OAuth
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Generate a test user ID
    const userId = `test-${Date.now()}`
    
    // Set auth cookies
    await setAuthCookies(userId, email)
    
    return NextResponse.json({ 
      success: true,
      message: 'Test login successful',
      user: {
        id: userId,
        email,
      }
    })
    
  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Failed to create test session' },
      { status: 500 }
    )
  }
}