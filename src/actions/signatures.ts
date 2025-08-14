'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { signatures, signatureUsage, type Signature, type NewSignature, type SignatureUsage, type NewSignatureUsage } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { signatureSchema, type SignatureInput } from '@/lib/validations'
import { createHash } from 'crypto'

/**
 * Generate SHA-256 hash for signature data integrity
 */
function generateSignatureHash(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

/**
 * Get all signatures for the authenticated user
 */
export async function getSignatures(): Promise<Signature[]> {
  try {
    const user = await requireAuth()
    
    const userSignatures = await db
      .select()
      .from(signatures)
      .where(eq(signatures.userId, user.id))
      .orderBy(desc(signatures.createdAt))
    
    return userSignatures
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getSignatures' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch signatures')
  }
}

/**
 * Get a specific signature by ID (user-scoped)
 */
export async function getSignature(signatureId: string): Promise<Signature | null> {
  try {
    const user = await requireAuth()
    
    const [signature] = await db
      .select()
      .from(signatures)
      .where(and(
        eq(signatures.id, signatureId),
        eq(signatures.userId, user.id)
      ))
      .limit(1)
    
    return signature || null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getSignature' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId },
    })
    throw new Error('Failed to fetch signature')
  }
}

/**
 * Create a new signature
 */
export async function createSignature(input: SignatureInput): Promise<Signature> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = signatureSchema.parse(input)
    
    // Generate hash for integrity verification
    const hash = generateSignatureHash(validatedInput.data)
    
    const [newSignature] = await db
      .insert(signatures)
      .values({
        userId: user.id,
        name: validatedInput.name,
        signatureType: validatedInput.signatureType,
        data: validatedInput.data,
        hash,
        signatureMetadata: validatedInput.metadata,
      })
      .returning()
    
    // Track signature creation
    Sentry.addBreadcrumb({
      category: 'signature',
      message: 'Signature created successfully',
      level: 'info',
      data: {
        signatureId: newSignature.id,
        signatureType: newSignature.signatureType,
        userId: user.id,
      },
    })
    
    // Revalidate signatures page
    revalidatePath('/signatures')
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return newSignature
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'createSignature' },
      user: { id: (await requireAuth()).id },
      extra: { input: { ...input, data: '[REDACTED]' } }, // Don't log signature data
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create signature')
  }
}

/**
 * Update an existing signature
 */
export async function updateSignature(signatureId: string, input: SignatureInput): Promise<Signature> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = signatureSchema.parse(input)
    
    // Generate new hash for integrity verification
    const hash = generateSignatureHash(validatedInput.data)
    
    const [updatedSignature] = await db
      .update(signatures)
      .set({
        name: validatedInput.name,
        signatureType: validatedInput.signatureType,
        data: validatedInput.data,
        hash,
        signatureMetadata: validatedInput.metadata,
        updatedAt: new Date(),
      })
      .where(and(
        eq(signatures.id, signatureId),
        eq(signatures.userId, user.id)
      ))
      .returning()
    
    if (!updatedSignature) {
      throw new Error('Signature not found or unauthorized')
    }
    
    // Track signature update
    Sentry.addBreadcrumb({
      category: 'signature',
      message: 'Signature updated successfully',
      level: 'info',
      data: {
        signatureId: updatedSignature.id,
        signatureType: updatedSignature.signatureType,
        userId: user.id,
      },
    })
    
    // Revalidate signatures page
    revalidatePath('/signatures')
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
    
    return updatedSignature
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateSignature' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId, input: { ...input, data: '[REDACTED]' } },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update signature')
  }
}

/**
 * Delete a signature
 */
export async function deleteSignature(signatureId: string): Promise<void> {
  try {
    const user = await requireAuth()
    
    const [deletedSignature] = await db
      .delete(signatures)
      .where(and(
        eq(signatures.id, signatureId),
        eq(signatures.userId, user.id)
      ))
      .returning()
    
    if (!deletedSignature) {
      throw new Error('Signature not found or unauthorized')
    }
    
    // Track signature deletion
    Sentry.addBreadcrumb({
      category: 'signature',
      message: 'Signature deleted successfully',
      level: 'info',
      data: {
        signatureId: deletedSignature.id,
        signatureType: deletedSignature.signatureType,
        userId: user.id,
      },
    })
    
    // Revalidate signatures page
    revalidatePath('/signatures')
    revalidatePath('/onboarding')
    revalidatePath('/dashboard')
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'deleteSignature' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete signature')
  }
}

/**
 * Record signature usage for audit trail
 */
export async function recordSignatureUsage(
  signatureId: string,
  documentType: string,
  documentId?: string,
  context?: Record<string, unknown>
): Promise<SignatureUsage> {
  try {
    const user = await requireAuth()
    
    // Verify signature belongs to user
    const signature = await getSignature(signatureId)
    if (!signature) {
      throw new Error('Signature not found or unauthorized')
    }
    
    // Update signature last used timestamp
    await db
      .update(signatures)
      .set({ lastUsed: new Date() })
      .where(eq(signatures.id, signatureId))
    
    // Record usage
    const [usage] = await db
      .insert(signatureUsage)
      .values({
        signatureId,
        userId: user.id,
        documentType,
        documentId,
        context,
      })
      .returning()
    
    // Track signature usage
    Sentry.addBreadcrumb({
      category: 'signature',
      message: 'Signature usage recorded',
      level: 'info',
      data: {
        signatureId,
        documentType,
        documentId,
        userId: user.id,
      },
    })
    
    return usage
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'recordSignatureUsage' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId, documentType, documentId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to record signature usage')
  }
}

/**
 * Get signature usage history for a specific signature
 */
export async function getSignatureUsageHistory(signatureId: string): Promise<SignatureUsage[]> {
  try {
    const user = await requireAuth()
    
    // Verify signature belongs to user
    const signature = await getSignature(signatureId)
    if (!signature) {
      throw new Error('Signature not found or unauthorized')
    }
    
    const usageHistory = await db
      .select()
      .from(signatureUsage)
      .where(and(
        eq(signatureUsage.signatureId, signatureId),
        eq(signatureUsage.userId, user.id)
      ))
      .orderBy(desc(signatureUsage.usedAt))
    
    return usageHistory
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getSignatureUsageHistory' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId },
    })
    throw new Error('Failed to fetch signature usage history')
  }
}

/**
 * Verify signature integrity by checking hash
 */
export async function verifySignatureIntegrity(signatureId: string): Promise<boolean> {
  try {
    const user = await requireAuth()
    
    const signature = await getSignature(signatureId)
    if (!signature) {
      throw new Error('Signature not found or unauthorized')
    }
    
    // Generate hash from current data and compare with stored hash
    const currentHash = generateSignatureHash(signature.data)
    const isValid = currentHash === signature.hash
    
    // Track integrity check
    Sentry.addBreadcrumb({
      category: 'signature',
      message: `Signature integrity check: ${isValid ? 'VALID' : 'INVALID'}`,
      level: isValid ? 'info' : 'warning',
      data: {
        signatureId,
        isValid,
        userId: user.id,
      },
    })
    
    return isValid
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'verifySignatureIntegrity' },
      user: { id: (await requireAuth()).id },
      extra: { signatureId },
    })
    throw new Error('Failed to verify signature integrity')
  }
}