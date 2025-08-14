import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists and check onboarding status
    const user = await db.select({
      email: users.email,
      personalInfoCompleted: users.personalInfoCompleted,
      signatureCompleted: users.signatureCompleted,
      legalConsentCompleted: users.legalConsentCompleted,
      verificationCompleted: users.verificationCompleted,
      onboardingStatus: users.onboardingStatus,
      onboardingCompletedAt: users.onboardingCompletedAt
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]

    // Check if already completed
    if (userData.onboardingStatus === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Onboarding already completed',
        redirectTo: '/dashboard',
        completedAt: userData.onboardingCompletedAt
      })
    }

    // Validate all steps are completed
    const incompleteSteps: string[] = []
    
    if (!userData.personalInfoCompleted) {
      incompleteSteps.push('personal_info')
    }
    if (!userData.signatureCompleted) {
      incompleteSteps.push('signature')
    }
    if (!userData.legalConsentCompleted) {
      incompleteSteps.push('legal_consent')
    }
    if (!userData.verificationCompleted) {
      incompleteSteps.push('verification')
    }

    if (incompleteSteps.length > 0) {
      return NextResponse.json({ 
        error: 'Onboarding incomplete',
        incompleteSteps,
        message: `Please complete the following steps: ${incompleteSteps.join(', ')}`
      }, { status: 400 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const completedAt = new Date()

    // Mark onboarding as complete
    await db.update(users)
      .set({
        onboardingStatus: 'completed',
        onboardingCurrentStep: 'completed',
        onboardingCompletedAt: completedAt,
        updatedAt: completedAt
      })
      .where(eq(users.email, session.user.email))

    // Create completion audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'onboarding',
      eventAction: 'onboarding_completed',
      resourceType: 'onboarding_flow',
      resourceId: session.user.email,
      eventData: {
        completedSteps: ['personal_info', 'signature', 'legal_consent', 'verification'],
        completionTime: completedAt.toISOString(),
        userAgent: userAgent.substring(0, 500)
      },
      ipAddress,
      userAgent,
      eventTime: completedAt
    })

    console.log(`Onboarding completed successfully for user ${session.user.email}`)

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding completed successfully! Welcome to Herit.',
      redirectTo: '/dashboard',
      completedAt: completedAt.toISOString(),
      completedSteps: ['personal_info', 'signature', 'legal_consent', 'verification']
    })

  } catch (error) {
    console.error('Error completing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}

// GET - Check onboarding completion status
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user onboarding status
    const user = await db.select({
      onboardingStatus: users.onboardingStatus,
      onboardingCurrentStep: users.onboardingCurrentStep,
      onboardingCompletedAt: users.onboardingCompletedAt,
      personalInfoCompleted: users.personalInfoCompleted,
      signatureCompleted: users.signatureCompleted,
      legalConsentCompleted: users.legalConsentCompleted,
      verificationCompleted: users.verificationCompleted,
      personalInfoCompletedAt: users.personalInfoCompletedAt,
      signatureCompletedAt: users.signatureCompletedAt,
      legalConsentCompletedAt: users.legalConsentCompletedAt,
      verificationCompletedAt: users.verificationCompletedAt
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]

    const stepStatus = {
      personal_info: {
        completed: userData.personalInfoCompleted || false,
        completedAt: userData.personalInfoCompletedAt
      },
      signature: {
        completed: userData.signatureCompleted || false,
        completedAt: userData.signatureCompletedAt
      },
      legal_consent: {
        completed: userData.legalConsentCompleted || false,
        completedAt: userData.legalConsentCompletedAt
      },
      verification: {
        completed: userData.verificationCompleted || false,
        completedAt: userData.verificationCompletedAt
      }
    }

    const completedSteps = Object.keys(stepStatus).filter(step => stepStatus[step as keyof typeof stepStatus].completed)
    const progress = (completedSteps.length / 4) * 100

    return NextResponse.json({
      success: true,
      onboardingStatus: userData.onboardingStatus || 'not_started',
      currentStep: userData.onboardingCurrentStep || 'personal_info',
      completedAt: userData.onboardingCompletedAt,
      progress,
      stepStatus,
      completedSteps,
      totalSteps: 4
    })

  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}