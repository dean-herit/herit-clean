'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { wills, type Will, type NewWill } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { willSchema, type WillInput } from '@/lib/validations'

/**
 * Get all wills for the authenticated user
 */
export async function getWills(): Promise<Will[]> {
  try {
    const user = await requireAuth()
    
    const userWills = await db
      .select()
      .from(wills)
      .where(eq(wills.userId, user.id))
      .orderBy(desc(wills.createdAt))
    
    return userWills
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getWills' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch wills')
  }
}

/**
 * Get a specific will by ID (user-scoped)
 */
export async function getWill(willId: string): Promise<Will | null> {
  try {
    const user = await requireAuth()
    
    const [will] = await db
      .select()
      .from(wills)
      .where(and(
        eq(wills.id, willId),
        eq(wills.userId, user.id)
      ))
      .limit(1)
    
    return will || null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getWill' },
      user: { id: (await requireAuth()).id },
      extra: { willId },
    })
    throw new Error('Failed to fetch will')
  }
}

/**
 * Get the current active will for the authenticated user
 */
export async function getCurrentWill(): Promise<Will | null> {
  try {
    const user = await requireAuth()
    
    // Get the most recent will that's not in draft status
    const [currentWill] = await db
      .select()
      .from(wills)
      .where(and(
        eq(wills.userId, user.id),
        ne(wills.status, 'draft')
      ))
      .orderBy(desc(wills.version), desc(wills.createdAt))
      .limit(1)
    
    // If no finalized will, get the latest draft
    if (!currentWill) {
      const [draftWill] = await db
        .select()
        .from(wills)
        .where(eq(wills.userId, user.id))
        .orderBy(desc(wills.createdAt))
        .limit(1)
      
      return draftWill || null
    }
    
    return currentWill
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getCurrentWill' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch current will')
  }
}

/**
 * Create a new will
 */
export async function createWill(input: WillInput): Promise<Will> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = willSchema.parse(input)
    
    // Determine version number (increment from latest will)
    const latestWills = await db
      .select({ version: wills.version })
      .from(wills)
      .where(eq(wills.userId, user.id))
      .orderBy(desc(wills.version))
      .limit(1)
    
    const nextVersion = (latestWills[0]?.version || 0) + 1
    
    const [newWill] = await db
      .insert(wills)
      .values({
        userId: user.id,
        title: validatedInput.title,
        willType: validatedInput.willType,
        content: validatedInput.content,
        preferences: validatedInput.preferences,
        version: nextVersion,
        status: 'draft',
      })
      .returning()
    
    // Track will creation
    Sentry.addBreadcrumb({
      category: 'will',
      message: 'Will created successfully',
      level: 'info',
      data: {
        willId: newWill.id,
        willType: newWill.willType,
        version: newWill.version,
        userId: user.id,
      },
    })
    
    // Revalidate wills page
    revalidatePath('/wills')
    revalidatePath('/dashboard')
    
    return newWill
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'createWill' },
      user: { id: (await requireAuth()).id },
      extra: { input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create will')
  }
}

/**
 * Update an existing will
 */
export async function updateWill(willId: string, input: WillInput): Promise<Will> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = willSchema.parse(input)
    
    const [updatedWill] = await db
      .update(wills)
      .set({
        title: validatedInput.title,
        willType: validatedInput.willType,
        content: validatedInput.content,
        preferences: validatedInput.preferences,
        updatedAt: new Date(),
      })
      .where(and(
        eq(wills.id, willId),
        eq(wills.userId, user.id)
      ))
      .returning()
    
    if (!updatedWill) {
      throw new Error('Will not found or unauthorized')
    }
    
    // Track will update
    Sentry.addBreadcrumb({
      category: 'will',
      message: 'Will updated successfully',
      level: 'info',
      data: {
        willId: updatedWill.id,
        willType: updatedWill.willType,
        version: updatedWill.version,
        userId: user.id,
      },
    })
    
    // Revalidate wills page
    revalidatePath('/wills')
    revalidatePath('/dashboard')
    
    return updatedWill
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateWill' },
      user: { id: (await requireAuth()).id },
      extra: { willId, input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update will')
  }
}

/**
 * Finalize a will (change status from draft to finalized)
 */
export async function finalizeWill(willId: string): Promise<Will> {
  try {
    const user = await requireAuth()
    
    const [finalizedWill] = await db
      .update(wills)
      .set({
        status: 'finalized',
        finalizedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(wills.id, willId),
        eq(wills.userId, user.id),
        eq(wills.status, 'draft') // Can only finalize draft wills
      ))
      .returning()
    
    if (!finalizedWill) {
      throw new Error('Will not found, unauthorized, or not in draft status')
    }
    
    // Track will finalization
    Sentry.addBreadcrumb({
      category: 'will',
      message: 'Will finalized successfully',
      level: 'info',
      data: {
        willId: finalizedWill.id,
        version: finalizedWill.version,
        userId: user.id,
      },
    })
    
    // Revalidate wills page
    revalidatePath('/wills')
    revalidatePath('/dashboard')
    
    return finalizedWill
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'finalizeWill' },
      user: { id: (await requireAuth()).id },
      extra: { willId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to finalize will')
  }
}

/**
 * Delete a will (only drafts can be deleted)
 */
export async function deleteWill(willId: string): Promise<void> {
  try {
    const user = await requireAuth()
    
    const [deletedWill] = await db
      .delete(wills)
      .where(and(
        eq(wills.id, willId),
        eq(wills.userId, user.id),
        eq(wills.status, 'draft') // Can only delete draft wills
      ))
      .returning()
    
    if (!deletedWill) {
      throw new Error('Will not found, unauthorized, or cannot be deleted')
    }
    
    // Track will deletion
    Sentry.addBreadcrumb({
      category: 'will',
      message: 'Will deleted successfully',
      level: 'info',
      data: {
        willId: deletedWill.id,
        version: deletedWill.version,
        userId: user.id,
      },
    })
    
    // Revalidate wills page
    revalidatePath('/wills')
    revalidatePath('/dashboard')
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'deleteWill' },
      user: { id: (await requireAuth()).id },
      extra: { willId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete will')
  }
}

/**
 * Update will document hash and URL after PDF generation
 */
export async function updateWillDocument(
  willId: string, 
  documentHash: string, 
  documentUrl: string
): Promise<Will> {
  try {
    const user = await requireAuth()
    
    const [updatedWill] = await db
      .update(wills)
      .set({
        documentHash,
        documentUrl,
        updatedAt: new Date(),
      })
      .where(and(
        eq(wills.id, willId),
        eq(wills.userId, user.id)
      ))
      .returning()
    
    if (!updatedWill) {
      throw new Error('Will not found or unauthorized')
    }
    
    // Track document update
    Sentry.addBreadcrumb({
      category: 'will',
      message: 'Will document updated successfully',
      level: 'info',
      data: {
        willId: updatedWill.id,
        hasDocument: !!documentUrl,
        userId: user.id,
      },
    })
    
    // Revalidate wills page
    revalidatePath('/wills')
    revalidatePath('/dashboard')
    
    return updatedWill
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateWillDocument' },
      user: { id: (await requireAuth()).id },
      extra: { willId, documentHash, documentUrl },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update will document')
  }
}

// Fix missing import
import { ne } from 'drizzle-orm'