import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data to include in verification metadata
    const user = await db.select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      verificationStatus: users.verificationStatus,
      verificationSessionId: users.verificationSessionId
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]

    // Check if user already has a pending verification
    if (userData.verificationStatus === 'processing' && userData.verificationSessionId) {
      return NextResponse.json({
        success: true,
        verification_url: null,
        verification_id: userData.verificationSessionId,
        status: 'processing',
        message: 'Verification already in progress'
      })
    }

    // Mock implementation for development/testing
    const useMock = process.env.NODE_ENV === 'development' || !process.env.STRIPE_SECRET_KEY
    
    let verificationSession: any
    let verificationUrl: string | null = null
    let verificationId: string
    
    if (useMock) {
      // Create mock verification session
      verificationId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      verificationUrl = null // Mock mode doesn't need external URL
      
      console.log(`Mock verification started for user ${session.user.email}`)
    } else {
      // Real Stripe Identity implementation
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
        
        verificationSession = await stripe.identity.verificationSessions.create({
          type: 'document',
          metadata: {
            user_email: session.user.email,
            user_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            onboarding_flow: 'true'
          },
          return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/onboarding?step=3&verification=complete`,
          options: {
            document: {
              require_id_number: true,
              require_live_capture: true,
              require_matching_selfie: true
            }
          }
        })
        
        verificationId = verificationSession.id
        verificationUrl = verificationSession.url
        
        console.log(`Stripe verification session created: ${verificationId}`)
      } catch (stripeError) {
        console.error('Stripe verification error:', stripeError)
        return NextResponse.json(
          { error: 'Failed to create verification session with Stripe' },
          { status: 500 }
        )
      }
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Update user record with verification session info
    await db.update(users)
      .set({
        verificationSessionId: verificationId,
        verificationStatus: 'processing',
        updatedAt: new Date()
      })
      .where(eq(users.email, session.user.email))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'verification',
      eventAction: 'verification_session_created',
      resourceType: 'verification_session',
      resourceId: verificationId,
      eventData: {
        sessionType: useMock ? 'mock' : 'stripe',
        verificationId,
        hasUrl: !!verificationUrl,
        userHasName: !!(userData.firstName && userData.lastName)
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      verification_url: verificationUrl,
      verification_id: verificationId,
      status: 'processing',
      message: useMock 
        ? 'Mock verification session created - check verification status endpoint' 
        : 'Stripe verification session created successfully'
    })

  } catch (error) {
    console.error('Error starting verification:', error)
    return NextResponse.json(
      { error: 'Failed to start verification' },
      { status: 500 }
    )
  }
}