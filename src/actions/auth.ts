'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { users, type User } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { personalInfoSchema, type PersonalInfo } from '@/lib/validations'

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<User> {
  try {
    const user = await requireAuth()
    
    const [userProfile] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    
    if (!userProfile) {
      throw new Error('User profile not found')
    }
    
    return userProfile
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getUserProfile' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch user profile')
  }
}

/**
 * Update user personal information
 */
export async function updatePersonalInfo(input: PersonalInfo): Promise<User> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = personalInfoSchema.parse(input)
    
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName: validatedInput.firstName,
        lastName: validatedInput.lastName,
        dateOfBirth: validatedInput.dateOfBirth,
        phoneNumber: validatedInput.phoneNumber,
        addressLine1: validatedInput.addressLine1,
        addressLine2: validatedInput.addressLine2,
        city: validatedInput.city,
        county: validatedInput.county,
        eircode: validatedInput.eircode,
        personalInfoCompleted: true,
        personalInfoCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning()
    
    if (!updatedUser) {
      throw new Error('Failed to update user profile')
    }
    
    // Track personal info update
    Sentry.addBreadcrumb({
      category: 'user',
      message: 'Personal information updated successfully',
      level: 'info',
      data: {
        userId: user.id,
        personalInfoCompleted: true,
      },
    })
    
    // Update Sentry user context
    Sentry.setUser({
      id: updatedUser.id,
      email: updatedUser.email,
      username: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    })
    
    // Revalidate profile and dashboard pages
    revalidatePath('/profile')
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return updatedUser
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updatePersonalInfo' },
      user: { id: (await requireAuth()).id },
      extra: { input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update personal information')
  }
}

/**
 * Update onboarding step completion
 */
export async function updateOnboardingStep(
  step: string,
  completed: boolean = true,
  nextStep?: string
): Promise<User> {
  try {
    const user = await requireAuth()
    
    const updateData: Partial<User> = {
      updatedAt: new Date(),
    }
    
    // Update specific step completion
    switch (step) {
      case 'personal_info':
        updateData.personalInfoCompleted = completed
        updateData.personalInfoCompletedAt = completed ? new Date() : null
        break
      case 'signature':
        updateData.signatureCompleted = completed
        updateData.signatureCompletedAt = completed ? new Date() : null
        break
      case 'legal_consent':
        updateData.legalConsentCompleted = completed
        updateData.legalConsentCompletedAt = completed ? new Date() : null
        break
      case 'verification':
        updateData.verificationCompleted = completed
        updateData.verificationCompletedAt = completed ? new Date() : null
        break
      default:
        throw new Error(`Invalid onboarding step: ${step}`)
    }
    
    // Update current step
    if (nextStep) {
      updateData.onboardingCurrentStep = nextStep
    }
    
    // Check if all steps are completed
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    
    if (currentUser) {
      const allStepsCompleted = [
        updateData.personalInfoCompleted ?? currentUser.personalInfoCompleted,
        updateData.signatureCompleted ?? currentUser.signatureCompleted,
        updateData.legalConsentCompleted ?? currentUser.legalConsentCompleted,
        updateData.verificationCompleted ?? currentUser.verificationCompleted,
      ].every(Boolean)
      
      if (allStepsCompleted) {
        updateData.onboardingStatus = 'completed'
        updateData.onboardingCompletedAt = new Date()
        updateData.onboardingCurrentStep = 'completed'
      } else {
        updateData.onboardingStatus = 'in_progress'
      }
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning()
    
    if (!updatedUser) {
      throw new Error('Failed to update onboarding step')
    }
    
    // Track onboarding progress
    Sentry.addBreadcrumb({
      category: 'onboarding',
      message: `Onboarding step ${step} ${completed ? 'completed' : 'reset'}`,
      level: 'info',
      data: {
        userId: user.id,
        step,
        completed,
        nextStep,
        onboardingStatus: updatedUser.onboardingStatus,
      },
    })
    
    // Revalidate onboarding and dashboard pages
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return updatedUser
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateOnboardingStep' },
      user: { id: (await requireAuth()).id },
      extra: { step, completed, nextStep },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update onboarding step')
  }
}

/**
 * Update legal consents
 */
export async function updateLegalConsents(consents: Record<string, unknown>): Promise<User> {
  try {
    const user = await requireAuth()
    
    const [updatedUser] = await db
      .update(users)
      .set({
        legalConsents: consents,
        legalConsentCompleted: true,
        legalConsentCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning()
    
    if (!updatedUser) {
      throw new Error('Failed to update legal consents')
    }
    
    // Track legal consent completion
    Sentry.addBreadcrumb({
      category: 'onboarding',
      message: 'Legal consents updated successfully',
      level: 'info',
      data: {
        userId: user.id,
        consentTypes: Object.keys(consents),
      },
    })
    
    // Revalidate onboarding and dashboard pages
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return updatedUser
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateLegalConsents' },
      user: { id: (await requireAuth()).id },
      extra: { consents },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update legal consents')
  }
}

/**
 * Update verification status
 */
export async function updateVerificationStatus(
  sessionId: string,
  status: string,
  isVerified: boolean = false
): Promise<User> {
  try {
    const user = await requireAuth()
    
    const [updatedUser] = await db
      .update(users)
      .set({
        verificationSessionId: sessionId,
        verificationStatus: status,
        verificationCompleted: isVerified,
        verificationCompletedAt: isVerified ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning()
    
    if (!updatedUser) {
      throw new Error('Failed to update verification status')
    }
    
    // Track verification status update
    Sentry.addBreadcrumb({
      category: 'verification',
      message: `Verification status updated: ${status}`,
      level: isVerified ? 'info' : 'warning',
      data: {
        userId: user.id,
        sessionId,
        status,
        isVerified,
      },
    })
    
    // Revalidate onboarding and dashboard pages
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return updatedUser
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateVerificationStatus' },
      user: { id: (await requireAuth()).id },
      extra: { sessionId, status, isVerified },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update verification status')
  }
}