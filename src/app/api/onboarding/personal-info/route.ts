import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'

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

// GET - Retrieve personal information
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      dateOfBirth: users.dateOfBirth,
      phoneNumber: users.phoneNumber,
      addressLine1: users.addressLine1,
      addressLine2: users.addressLine2,
      city: users.city,
      county: users.county,
      eircode: users.eircode,
      personalInfoCompleted: users.personalInfoCompleted,
      personalInfoCompletedAt: users.personalInfoCompletedAt
    })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1)

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = user[0]
    
    return NextResponse.json({
      success: true,
      data: {
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        email: userData.email,
        date_of_birth: userData.dateOfBirth || '',
        phone_number: userData.phoneNumber || '',
        address_line_1: userData.addressLine1 || '',
        address_line_2: userData.addressLine2 || '',
        city: userData.city || '',
        county: userData.county || '',
        eircode: userData.eircode || '',
        profile_photo: null // TODO: Implement with Vercel Blob
      },
      completed: userData.personalInfoCompleted,
      completedAt: userData.personalInfoCompletedAt
    })

  } catch (error) {
    console.error('Error fetching personal info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal information' },
      { status: 500 }
    )
  }
}

// POST - Save personal information
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const personalInfo: PersonalInfoData = await request.json()

    // Validation
    const errors: Record<string, string> = {}
    
    if (!personalInfo.first_name?.trim()) {
      errors.first_name = 'First name is required'
    }
    
    if (!personalInfo.last_name?.trim()) {
      errors.last_name = 'Last name is required'
    }
    
    if (!personalInfo.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required'
    } else {
      const birthDate = new Date(personalInfo.date_of_birth)
      const eighteenYearsAgo = new Date()
      eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18)
      
      if (birthDate > eighteenYearsAgo) {
        errors.date_of_birth = 'You must be at least 18 years old'
      }
    }
    
    if (!personalInfo.phone_number?.trim()) {
      errors.phone_number = 'Phone number is required'
    }
    
    if (!personalInfo.address_line_1?.trim()) {
      errors.address_line_1 = 'Street address is required'
    }
    
    if (!personalInfo.city?.trim()) {
      errors.city = 'City is required'
    }
    
    if (!personalInfo.county) {
      errors.county = 'County is required'
    }
    
    if (!personalInfo.eircode?.trim()) {
      errors.eircode = 'Eircode is required'
    } else {
      const eircodePattern = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i
      if (!eircodePattern.test(personalInfo.eircode.replace(/\s/g, ''))) {
        errors.eircode = 'Please enter a valid Eircode (e.g., D02 XY45)'
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        errors 
      }, { status: 400 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Update user record
    await db.update(users)
      .set({
        firstName: personalInfo.first_name.trim(),
        lastName: personalInfo.last_name.trim(),
        dateOfBirth: personalInfo.date_of_birth,
        phoneNumber: personalInfo.phone_number.trim(),
        addressLine1: personalInfo.address_line_1.trim(),
        addressLine2: personalInfo.address_line_2?.trim() || null,
        city: personalInfo.city.trim(),
        county: personalInfo.county,
        eircode: personalInfo.eircode.toUpperCase().replace(/\s/g, ''),
        personalInfoCompleted: true,
        personalInfoCompletedAt: new Date(),
        onboardingCurrentStep: 'signature',
        updatedAt: new Date()
      })
      .where(eq(users.email, session.user.email))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'onboarding',
      eventAction: 'personal_info_completed',
      resourceType: 'user_profile',
      resourceId: session.user.email,
      eventData: {
        hasProfilePhoto: !!personalInfo.profile_photo,
        addressCounty: personalInfo.county,
        completedViaAPI: true
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Personal information saved successfully',
      nextStep: 'signature'
    })

  } catch (error) {
    console.error('Error saving personal info:', error)
    return NextResponse.json(
      { error: 'Failed to save personal information' },
      { status: 500 }
    )
  }
}