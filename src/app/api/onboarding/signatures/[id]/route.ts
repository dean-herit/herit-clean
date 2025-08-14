import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { signatures, signatureUsage, auditEvents } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createHash } from 'crypto'

interface SignatureUpdateData {
  name?: string
  data?: string
  metadata?: Record<string, any>
}

interface SignatureUsageData {
  documentType: string
  documentId?: string
  context?: Record<string, any>
}

// GET - Retrieve specific signature
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const signature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))
      .limit(1)

    if (!signature.length) {
      return NextResponse.json({ 
        error: 'Signature not found or access denied' 
      }, { status: 404 })
    }

    const sig = signature[0]

    return NextResponse.json({
      success: true,
      signature: {
        id: sig.id,
        name: sig.name,
        data: sig.data,
        type: sig.signatureType,
        hash: sig.hash,
        metadata: sig.signatureMetadata,
        createdAt: sig.createdAt,
        updatedAt: sig.updatedAt,
        lastUsed: sig.lastUsed
      }
    })

  } catch (error) {
    console.error('Error fetching signature:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signature' },
      { status: 500 }
    )
  }
}

// PATCH - Update signature
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updateData: SignatureUpdateData = await request.json()

    // Verify signature belongs to user
    const existingSignature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))
      .limit(1)

    if (!existingSignature.length) {
      return NextResponse.json({ 
        error: 'Signature not found or access denied' 
      }, { status: 404 })
    }

    const updates: any = {
      updatedAt: new Date()
    }

    // Update name if provided
    if (updateData.name !== undefined) {
      if (!updateData.name.trim()) {
        return NextResponse.json({ 
          error: 'Signature name cannot be empty' 
        }, { status: 400 })
      }
      updates.name = updateData.name.trim()
    }

    // Update signature data if provided
    if (updateData.data !== undefined) {
      if (!updateData.data || updateData.data.length < 100) {
        return NextResponse.json({ 
          error: 'Signature data appears to be empty or too small' 
        }, { status: 400 })
      }
      
      // Generate new hash
      const newHash = createHash('sha256').update(updateData.data).digest('hex')
      updates.data = updateData.data
      updates.hash = newHash
    }

    // Update metadata if provided
    if (updateData.metadata !== undefined) {
      const existingMetadata = existingSignature[0].signatureMetadata || {}
      updates.signatureMetadata = {
        ...existingMetadata,
        ...updateData.metadata,
        lastModified: new Date().toISOString()
      }
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Update signature
    await db.update(signatures)
      .set(updates)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'signature',
      eventAction: 'signature_updated',
      resourceType: 'signature',
      resourceId: params.id,
      eventData: {
        updatedFields: Object.keys(updateData),
        hasNewData: !!updateData.data,
        hasNewMetadata: !!updateData.metadata
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Signature updated successfully'
    })

  } catch (error) {
    console.error('Error updating signature:', error)
    return NextResponse.json(
      { error: 'Failed to update signature' },
      { status: 500 }
    )
  }
}

// DELETE - Remove specific signature
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify signature belongs to user
    const signature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))
      .limit(1)

    if (!signature.length) {
      return NextResponse.json({ 
        error: 'Signature not found or access denied' 
      }, { status: 404 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Delete signature (this will cascade delete usage records due to foreign key)
    await db.delete(signatures)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'signature',
      eventAction: 'signature_deleted',
      resourceType: 'signature',
      resourceId: params.id,
      eventData: {
        signatureName: signature[0].name,
        signatureType: signature[0].signatureType,
        signatureHash: signature[0].hash
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Signature deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting signature:', error)
    return NextResponse.json(
      { error: 'Failed to delete signature' },
      { status: 500 }
    )
  }
}

// POST - Record signature usage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const usageData: SignatureUsageData = await request.json()

    if (!usageData.documentType) {
      return NextResponse.json({ 
        error: 'Document type is required' 
      }, { status: 400 })
    }

    // Verify signature belongs to user
    const signature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))
      .limit(1)

    if (!signature.length) {
      return NextResponse.json({ 
        error: 'Signature not found or access denied' 
      }, { status: 404 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Record signature usage
    await db.insert(signatureUsage).values({
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      signatureId: params.id,
      userId: session.user.email,
      documentType: usageData.documentType,
      documentId: usageData.documentId || null,
      context: usageData.context || null,
      usedAt: new Date()
    })

    // Update signature last used timestamp
    await db.update(signatures)
      .set({ 
        lastUsed: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(signatures.id, params.id),
        eq(signatures.userId, session.user.email)
      ))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'signature',
      eventAction: 'signature_used',
      resourceType: 'signature_usage',
      resourceId: params.id,
      eventData: {
        documentType: usageData.documentType,
        documentId: usageData.documentId,
        hasContext: !!usageData.context
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Signature usage recorded successfully'
    })

  } catch (error) {
    console.error('Error recording signature usage:', error)
    return NextResponse.json(
      { error: 'Failed to record signature usage' },
      { status: 500 }
    )
  }
}