import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user verification data from database
    const user = await db.select({
      verificationStatus: users.verificationStatus,
      verificationSessionId: users.verificationSessionId,
      verificationCompleted: users.verificationCompleted,
      verificationCompletedAt: users.verificationCompletedAt
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]
    
    // If no verification session exists
    if (!userData.verificationSessionId) {
      return NextResponse.json({
        status: 'not_started',
        message: 'No verification session found'
      })
    }

    // Mock implementation for development/testing
    const useMock = process.env.NODE_ENV === 'development' || !process.env.STRIPE_SECRET_KEY || userData.verificationSessionId.startsWith('mock_')
    
    if (useMock) {
      // For mock sessions, simulate verification completion after some time
      const sessionCreatedTime = parseInt(userData.verificationSessionId.split('_')[1]) || Date.now()
      const timeElapsed = Date.now() - sessionCreatedTime
      const shouldComplete = timeElapsed > 30000 // Auto-complete after 30 seconds
      
      let status = userData.verificationStatus || 'processing'
      let verifiedAt = userData.verificationCompletedAt
      
      // Auto-complete mock verification
      if (shouldComplete && status === 'processing') {
        status = 'verified'
        verifiedAt = new Date()
        
        // Update database with completed verification
        await db.update(users)
          .set({
            verificationStatus: 'verified',
            verificationCompleted: true,
            verificationCompletedAt: verifiedAt,
            onboardingCurrentStep: 'completed',
            onboardingStatus: 'completed',
            onboardingCompletedAt: verifiedAt,
            updatedAt: new Date()
          })
          .where(eq(users.email, session.user.email))

        // Create audit event
        await db.insert(auditEvents).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.email,
          eventType: 'verification',
          eventAction: 'verification_completed',
          resourceType: 'verification_session',
          resourceId: userData.verificationSessionId,
          eventData: {
            sessionType: 'mock',
            autoCompleted: true,
            timeElapsedMs: timeElapsed
          },
          ipAddress: 'system',
          userAgent: 'system',
          eventTime: new Date()
        })
      }
      
      return NextResponse.json({
        status,
        verification_id: userData.verificationSessionId,
        verified_at: verifiedAt?.toISOString() || null,
        details: {
          document_verified: status === 'verified',
          liveness_verified: status === 'verified',
          mock_session: true
        }
      })
    }

    // Real Stripe Identity implementation
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      
      const verificationSession = await stripe.identity.verificationSessions.retrieve(userData.verificationSessionId)
      
      // Map Stripe statuses to our application statuses
      let appStatus = userData.verificationStatus
      let shouldUpdateUser = false
      
      switch (verificationSession.status) {
        case 'verified':
          if (appStatus !== 'verified') {
            appStatus = 'verified'
            shouldUpdateUser = true
          }
          break
        case 'requires_input':
        case 'processing':
          appStatus = 'processing'
          break
        case 'canceled':
          appStatus = 'canceled'
          break
        default:
          appStatus = 'processing'
      }
      
      // Update user record if status changed
      if (shouldUpdateUser) {
        const updateData: any = {
          verificationStatus: appStatus,
          updatedAt: new Date()
        }
        
        if (appStatus === 'verified') {
          updateData.verificationCompleted = true
          updateData.verificationCompletedAt = new Date()
          updateData.onboardingCurrentStep = 'completed'
          updateData.onboardingStatus = 'completed'
          updateData.onboardingCompletedAt = new Date()
        }
        
        await db.update(users)
          .set(updateData)
          .where(eq(users.email, session.user.email))

        // Create audit event
        await db.insert(auditEvents).values({
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: session.user.email,
          eventType: 'verification',
          eventAction: appStatus === 'verified' ? 'verification_completed' : 'verification_status_updated',
          resourceType: 'verification_session',
          resourceId: userData.verificationSessionId,
          eventData: {
            sessionType: 'stripe',
            stripeStatus: verificationSession.status,
            appStatus: appStatus,
            hasReport: !!verificationSession.last_verification_report
          },
          ipAddress: 'stripe_webhook',
          userAgent: 'system',
          eventTime: new Date()
        })
      }
      
      return NextResponse.json({
        status: appStatus,
        verification_id: verificationSession.id,
        verified_at: null, // verificationSession.verified_at ? new Date(verificationSession.verified_at * 1000).toISOString() : null,
        details: {
          document_verified: false, // verificationSession.last_verification_report?.document?.status === 'verified',
          liveness_verified: false, // verificationSession.last_verification_report?.selfie?.status === 'verified',
          stripe_status: verificationSession.status
        }
      })

    } catch (stripeError: any) {
      console.error('Stripe verification status error:', stripeError)
      
      // If session not found in Stripe, it might be expired
      if (stripeError.code === 'resource_missing') {
        await db.update(users)
          .set({
            verificationStatus: 'expired',
            updatedAt: new Date()
          })
          .where(eq(users.email, session.user.email))
          
        return NextResponse.json({
          status: 'expired',
          verification_id: userData.verificationSessionId,
          message: 'Verification session expired'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to check verification status with Stripe' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error checking verification status:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}