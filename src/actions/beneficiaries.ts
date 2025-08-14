'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { beneficiaries, type Beneficiary, type NewBeneficiary } from '@/db/schema'
import { eq, and, desc, sum } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { beneficiarySchema, type BeneficiaryInput } from '@/lib/validations'

/**
 * Get all beneficiaries for the authenticated user
 */
export async function getBeneficiaries(): Promise<Beneficiary[]> {
  try {
    const user = await requireAuth()
    
    const userBeneficiaries = await db
      .select()
      .from(beneficiaries)
      .where(eq(beneficiaries.userId, user.id))
      .orderBy(desc(beneficiaries.createdAt))
    
    return userBeneficiaries
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getBeneficiaries' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch beneficiaries')
  }
}

/**
 * Get a specific beneficiary by ID (user-scoped)
 */
export async function getBeneficiary(beneficiaryId: string): Promise<Beneficiary | null> {
  try {
    const user = await requireAuth()
    
    const [beneficiary] = await db
      .select()
      .from(beneficiaries)
      .where(and(
        eq(beneficiaries.id, beneficiaryId),
        eq(beneficiaries.userId, user.id)
      ))
      .limit(1)
    
    return beneficiary || null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getBeneficiary' },
      user: { id: (await requireAuth()).id },
      extra: { beneficiaryId },
    })
    throw new Error('Failed to fetch beneficiary')
  }
}

/**
 * Create a new beneficiary
 */
export async function createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = beneficiarySchema.parse(input)
    
    // Check if percentage allocation exceeds 100%
    if (validatedInput.percentage !== undefined) {
      const currentTotal = await getTotalPercentageAllocated()
      if (currentTotal + validatedInput.percentage > 100) {
        throw new Error('Total percentage allocation cannot exceed 100%')
      }
    }
    
    const [newBeneficiary] = await db
      .insert(beneficiaries)
      .values({
        userId: user.id,
        name: validatedInput.name,
        relationshipType: validatedInput.relationshipType,
        email: validatedInput.email,
        phone: validatedInput.phone,
        addressLine1: validatedInput.addressLine1,
        addressLine2: validatedInput.addressLine2,
        city: validatedInput.city,
        county: validatedInput.county,
        eircode: validatedInput.eircode,
        country: validatedInput.country,
        percentage: validatedInput.percentage,
        conditions: validatedInput.conditions,
      })
      .returning()
    
    // Track beneficiary creation
    Sentry.addBreadcrumb({
      category: 'beneficiary',
      message: 'Beneficiary created successfully',
      level: 'info',
      data: {
        beneficiaryId: newBeneficiary.id,
        relationshipType: newBeneficiary.relationshipType,
        percentage: newBeneficiary.percentage,
        userId: user.id,
      },
    })
    
    // Revalidate beneficiaries page
    revalidatePath('/beneficiaries')
    revalidatePath('/dashboard')
    
    return newBeneficiary
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'createBeneficiary' },
      user: { id: (await requireAuth()).id },
      extra: { input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create beneficiary')
  }
}

/**
 * Update an existing beneficiary
 */
export async function updateBeneficiary(beneficiaryId: string, input: BeneficiaryInput): Promise<Beneficiary> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = beneficiarySchema.parse(input)
    
    // Check if percentage allocation exceeds 100% (excluding current beneficiary)
    if (validatedInput.percentage !== undefined) {
      const currentTotal = await getTotalPercentageAllocated(beneficiaryId)
      if (currentTotal + validatedInput.percentage > 100) {
        throw new Error('Total percentage allocation cannot exceed 100%')
      }
    }
    
    const [updatedBeneficiary] = await db
      .update(beneficiaries)
      .set({
        name: validatedInput.name,
        relationshipType: validatedInput.relationshipType,
        email: validatedInput.email,
        phone: validatedInput.phone,
        addressLine1: validatedInput.addressLine1,
        addressLine2: validatedInput.addressLine2,
        city: validatedInput.city,
        county: validatedInput.county,
        eircode: validatedInput.eircode,
        country: validatedInput.country,
        percentage: validatedInput.percentage,
        conditions: validatedInput.conditions,
        updatedAt: new Date(),
      })
      .where(and(
        eq(beneficiaries.id, beneficiaryId),
        eq(beneficiaries.userId, user.id)
      ))
      .returning()
    
    if (!updatedBeneficiary) {
      throw new Error('Beneficiary not found or unauthorized')
    }
    
    // Track beneficiary update
    Sentry.addBreadcrumb({
      category: 'beneficiary',
      message: 'Beneficiary updated successfully',
      level: 'info',
      data: {
        beneficiaryId: updatedBeneficiary.id,
        relationshipType: updatedBeneficiary.relationshipType,
        percentage: updatedBeneficiary.percentage,
        userId: user.id,
      },
    })
    
    // Revalidate beneficiaries page
    revalidatePath('/beneficiaries')
    revalidatePath('/dashboard')
    
    return updatedBeneficiary
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateBeneficiary' },
      user: { id: (await requireAuth()).id },
      extra: { beneficiaryId, input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update beneficiary')
  }
}

/**
 * Delete a beneficiary
 */
export async function deleteBeneficiary(beneficiaryId: string): Promise<void> {
  try {
    const user = await requireAuth()
    
    const [deletedBeneficiary] = await db
      .delete(beneficiaries)
      .where(and(
        eq(beneficiaries.id, beneficiaryId),
        eq(beneficiaries.userId, user.id)
      ))
      .returning()
    
    if (!deletedBeneficiary) {
      throw new Error('Beneficiary not found or unauthorized')
    }
    
    // Track beneficiary deletion
    Sentry.addBreadcrumb({
      category: 'beneficiary',
      message: 'Beneficiary deleted successfully',
      level: 'info',
      data: {
        beneficiaryId: deletedBeneficiary.id,
        relationshipType: deletedBeneficiary.relationshipType,
        userId: user.id,
      },
    })
    
    // Revalidate beneficiaries page
    revalidatePath('/beneficiaries')
    revalidatePath('/dashboard')
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'deleteBeneficiary' },
      user: { id: (await requireAuth()).id },
      extra: { beneficiaryId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete beneficiary')
  }
}

/**
 * Get total percentage allocated to beneficiaries (excluding specific beneficiary)
 */
export async function getTotalPercentageAllocated(excludeBeneficiaryId?: string): Promise<number> {
  try {
    const user = await requireAuth()
    
    const conditions = [
      eq(beneficiaries.userId, user.id),
      eq(beneficiaries.status, 'active')
    ]
    
    if (excludeBeneficiaryId) {
      conditions.push(ne(beneficiaries.id, excludeBeneficiaryId))
    }
    
    const query = db
      .select({ percentage: beneficiaries.percentage })
      .from(beneficiaries)
      .where(and(...conditions))
    
    const result = await query
    
    return result.reduce((total, beneficiary) => total + (beneficiary.percentage || 0), 0)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getTotalPercentageAllocated' },
      user: { id: (await requireAuth()).id },
      extra: { excludeBeneficiaryId },
    })
    throw new Error('Failed to calculate total percentage allocation')
  }
}

/**
 * Get beneficiaries count for the authenticated user
 */
export async function getBeneficiariesCount(): Promise<number> {
  try {
    const user = await requireAuth()
    
    const result = await db
      .select({ count: count() })
      .from(beneficiaries)
      .where(and(
        eq(beneficiaries.userId, user.id),
        eq(beneficiaries.status, 'active')
      ))
    
    return result[0]?.count || 0
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getBeneficiariesCount' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to get beneficiaries count')
  }
}

// Fix missing import
import { ne, count } from 'drizzle-orm'