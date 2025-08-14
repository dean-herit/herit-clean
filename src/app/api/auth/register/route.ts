import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, setAuthCookies } from '@/lib/auth'

// Registration request schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const result = registerSchema.safeParse(body)
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
    
    const { email, password, firstName, lastName } = result.data
    const normalizedEmail = email.toLowerCase()
    
    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An account with this email already exists' 
        },
        { status: 409 }
      )
    }
    
    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        authProvider: 'email',
        onboardingStatus: 'not_started',
        onboardingCurrentStep: 'personal_info',
      })
      .returning()
    
    // Set auth cookies (access + refresh tokens)
    await setAuthCookies(newUser.id, newUser.email)
    
    // Set Sentry user context for this session
    Sentry.setUser({
      id: newUser.id,
      email: newUser.email,
      username: `${newUser.firstName} ${newUser.lastName}`.trim(),
    })
    
    // Track successful registration
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'User registered successfully',
      level: 'info',
      data: {
        userId: newUser.id,
        email: newUser.email,
        authProvider: 'email',
      },
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        onboardingStatus: newUser.onboardingStatus,
        onboardingCurrentStep: newUser.onboardingCurrentStep,
      },
    })
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        operation: 'register',
        endpoint: '/api/auth/register',
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