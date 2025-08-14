'use server'

import { revalidatePath } from 'next/cache'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { assets, type Asset, type NewAsset } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth'
import { assetSchema, type AssetInput } from '@/lib/validations'

/**
 * Get all assets for the authenticated user
 */
export async function getAssets(): Promise<Asset[]> {
  try {
    const user = await requireAuth()
    
    const userAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, user.id))
      .orderBy(desc(assets.createdAt))
    
    return userAssets
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getAssets' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to fetch assets')
  }
}

/**
 * Get a specific asset by ID (user-scoped)
 */
export async function getAsset(assetId: string): Promise<Asset | null> {
  try {
    const user = await requireAuth()
    
    const [asset] = await db
      .select()
      .from(assets)
      .where(and(
        eq(assets.id, assetId),
        eq(assets.userId, user.id)
      ))
      .limit(1)
    
    return asset || null
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getAsset' },
      user: { id: (await requireAuth()).id },
      extra: { assetId },
    })
    throw new Error('Failed to fetch asset')
  }
}

/**
 * Create a new asset
 */
export async function createAsset(input: AssetInput): Promise<Asset> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = assetSchema.parse(input)
    
    const [newAsset] = await db
      .insert(assets)
      .values({
        userId: user.id,
        name: validatedInput.name,
        assetType: validatedInput.assetType,
        value: validatedInput.value,
        description: validatedInput.description,
        accountNumber: validatedInput.accountNumber,
        bankName: validatedInput.bankName,
        propertyAddress: validatedInput.propertyAddress,
      })
      .returning()
    
    // Track asset creation
    Sentry.addBreadcrumb({
      category: 'asset',
      message: 'Asset created successfully',
      level: 'info',
      data: {
        assetId: newAsset.id,
        assetType: newAsset.assetType,
        value: newAsset.value,
        userId: user.id,
      },
    })
    
    // Revalidate assets page
    revalidatePath('/assets')
    revalidatePath('/dashboard')
    
    return newAsset
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'createAsset' },
      user: { id: (await requireAuth()).id },
      extra: { input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to create asset')
  }
}

/**
 * Update an existing asset
 */
export async function updateAsset(assetId: string, input: AssetInput): Promise<Asset> {
  try {
    const user = await requireAuth()
    
    // Validate input
    const validatedInput = assetSchema.parse(input)
    
    const [updatedAsset] = await db
      .update(assets)
      .set({
        name: validatedInput.name,
        assetType: validatedInput.assetType,
        value: validatedInput.value,
        description: validatedInput.description,
        accountNumber: validatedInput.accountNumber,
        bankName: validatedInput.bankName,
        propertyAddress: validatedInput.propertyAddress,
        updatedAt: new Date(),
      })
      .where(and(
        eq(assets.id, assetId),
        eq(assets.userId, user.id)
      ))
      .returning()
    
    if (!updatedAsset) {
      throw new Error('Asset not found or unauthorized')
    }
    
    // Track asset update
    Sentry.addBreadcrumb({
      category: 'asset',
      message: 'Asset updated successfully',
      level: 'info',
      data: {
        assetId: updatedAsset.id,
        assetType: updatedAsset.assetType,
        value: updatedAsset.value,
        userId: user.id,
      },
    })
    
    // Revalidate assets page
    revalidatePath('/assets')
    revalidatePath('/dashboard')
    
    return updatedAsset
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'updateAsset' },
      user: { id: (await requireAuth()).id },
      extra: { assetId, input },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to update asset')
  }
}

/**
 * Delete an asset
 */
export async function deleteAsset(assetId: string): Promise<void> {
  try {
    const user = await requireAuth()
    
    const [deletedAsset] = await db
      .delete(assets)
      .where(and(
        eq(assets.id, assetId),
        eq(assets.userId, user.id)
      ))
      .returning()
    
    if (!deletedAsset) {
      throw new Error('Asset not found or unauthorized')
    }
    
    // Track asset deletion
    Sentry.addBreadcrumb({
      category: 'asset',
      message: 'Asset deleted successfully',
      level: 'info',
      data: {
        assetId: deletedAsset.id,
        assetType: deletedAsset.assetType,
        userId: user.id,
      },
    })
    
    // Revalidate assets page
    revalidatePath('/assets')
    revalidatePath('/dashboard')
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'deleteAsset' },
      user: { id: (await requireAuth()).id },
      extra: { assetId },
    })
    
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to delete asset')
  }
}

/**
 * Get total asset value for the authenticated user
 */
export async function getTotalAssetValue(): Promise<number> {
  try {
    const user = await requireAuth()
    
    const userAssets = await db
      .select({ value: assets.value })
      .from(assets)
      .where(and(
        eq(assets.userId, user.id),
        eq(assets.status, 'active')
      ))
    
    return userAssets.reduce((total, asset) => total + (asset.value || 0), 0)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: 'getTotalAssetValue' },
      user: { id: (await requireAuth()).id },
    })
    throw new Error('Failed to calculate total asset value')
  }
}