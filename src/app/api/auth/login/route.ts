import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, setAuthCookies } from '@/lib/auth'

// Login request schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const { email, password } = result.data
    
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)
    
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }
    
    // Set auth cookies (access + refresh tokens)
    await setAuthCookies(user.id, user.email)
    
    // Set Sentry user context for this session
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: `${user.firstName} ${user.lastName}`.trim() || user.email,
    })
    
    // Track successful login
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'User logged in successfully',
      level: 'info',
      data: {
        userId: user.id,
        email: user.email,
        onboardingStatus: user.onboardingStatus,
      },
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        onboardingStatus: user.onboardingStatus,
        onboardingCurrentStep: user.onboardingCurrentStep,
      },
    })
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'login',
        endpoint: '/api/auth/login',
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