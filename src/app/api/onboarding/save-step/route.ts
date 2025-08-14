import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, signatures, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createHash } from 'crypto'

interface PersonalInfoData {
  first_name: string
  last_name: string
  date_of_birth: string
  phone_number: string
  address_line_1: string
  address_line_2?: string
  city: string
  county: string
  eircode: string
  profile_photo?: string
}

interface SignatureData {
  id: string
  name: string
  data: string
  type: 'drawn' | 'uploaded' | 'template'
  createdAt: string
}

interface LegalConsentData {
  consents: string[]
  timestamp: string
  ipAddress: string
  userAgent: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step, data } = await request.json()
    const userEmail = session.user.email

    // Basic validation
    if (typeof step !== 'number' || step < 0 || step > 3) {
      return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 })
    }

    // Get client IP and user agent for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let updateData: any = {}
    let auditAction = ''
    let auditData: any = {}

    switch (step) {
      case 0: // Personal Information
        const personalInfo = data as PersonalInfoData
        updateData = {
          firstName: personalInfo.first_name,
          lastName: personalInfo.last_name,
          dateOfBirth: personalInfo.date_of_birth,
          phoneNumber: personalInfo.phone_number,
          addressLine1: personalInfo.address_line_1,
          addressLine2: personalInfo.address_line_2 || null,
          city: personalInfo.city,
          county: personalInfo.county,
          eircode: personalInfo.eircode,
          personalInfoCompleted: true,
          personalInfoCompletedAt: new Date(),
          onboardingCurrentStep: 'signature'
        }
        auditAction = 'personal_info_completed'
        auditData = { step: 0, hasProfilePhoto: !!personalInfo.profile_photo }
        break

      case 1: // Digital Signature
        const signatureInfo = data as SignatureData
        
        // Generate hash for signature integrity
        const signatureHash = createHash('sha256').update(signatureInfo.data).digest('hex')
        
        // Save signature to signatures table
        await db.insert(signatures).values({
          id: signatureInfo.id,
          userId: userEmail, // Using email as user ID per schema
          name: signatureInfo.name,
          signatureType: signatureInfo.type,
          data: signatureInfo.data,
          hash: signatureHash,
          signatureMetadata: {
            createdAt: signatureInfo.createdAt,
            createdDuringOnboarding: true
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        updateData = {
          signatureCompleted: true,
          signatureCompletedAt: new Date(),
          onboardingCurrentStep: 'legal_consent'
        }
        auditAction = 'signature_created'
        auditData = { 
          step: 1, 
          signatureId: signatureInfo.id, 
          signatureType: signatureInfo.type,
          signatureHash 
        }
        break

      case 2: // Legal Consent
        const consentInfo = data as LegalConsentData
        updateData = {
          legalConsentCompleted: true,
          legalConsentCompletedAt: new Date(),
          legalConsents: {
            consents: consentInfo.consents,
            timestamp: consentInfo.timestamp,
            ipAddress,
            userAgent,
            completedDuringOnboarding: true
          },
          onboardingCurrentStep: 'verification'
        }
        auditAction = 'legal_consent_completed'
        auditData = { 
          step: 2, 
          consentsCount: consentInfo.consents.length,
          consents: consentInfo.consents 
        }
        break

      case 3: // Identity Verification (handled separately in verification routes)
        return NextResponse.json({ error: 'Verification step handled by separate endpoint' }, { status: 400 })

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 })
    }

    // Update user record
    await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(users.email, userEmail))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userEmail,
      eventType: 'onboarding',
      eventAction: auditAction,
      resourceType: 'onboarding_step',
      resourceId: `step_${step}`,
      eventData: auditData,
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      step, 
      message: 'Step data saved successfully',
      nextStep: step < 3 ? step + 1 : null
    })

  } catch (error) {
    console.error('Error saving onboarding step:', error)
    return NextResponse.json(
      { error: 'Failed to save step data' },
      { status: 500 }
    )
  }
}