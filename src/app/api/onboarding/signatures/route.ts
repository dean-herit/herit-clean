import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/db/db'
import { signatures, auditEvents } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createHash } from 'crypto'

interface SignatureData {
  id: string
  name: string
  data: string // base64 or blob URL
  type: 'drawn' | 'uploaded' | 'template'
  metadata?: {
    width?: number
    height?: number
    mimeType?: string
    [key: string]: any
  }
}

// GET - Retrieve user signatures
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userSignatures = await db.select({
      id: signatures.id,
      name: signatures.name,
      signatureType: signatures.signatureType,
      data: signatures.data,
      hash: signatures.hash,
      signatureMetadata: signatures.signatureMetadata,
      createdAt: signatures.createdAt,
      lastUsed: signatures.lastUsed
    })
    .from(signatures)
    .where(eq(signatures.userId, session.user.email))

    return NextResponse.json({
      success: true,
      signatures: userSignatures.map(sig => ({
        id: sig.id,
        name: sig.name,
        data: sig.data,
        type: sig.signatureType,
        metadata: sig.signatureMetadata,
        createdAt: sig.createdAt,
        lastUsed: sig.lastUsed
      }))
    })

  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signatures' },
      { status: 500 }
    )
  }
}

// POST - Create new signature
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const signatureData: SignatureData = await request.json()

    // Validation
    if (!signatureData.id || !signatureData.name || !signatureData.data || !signatureData.type) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, name, data, type' 
      }, { status: 400 })
    }

    if (!['drawn', 'uploaded', 'template'].includes(signatureData.type)) {
      return NextResponse.json({ 
        error: 'Invalid signature type. Must be: drawn, uploaded, or template' 
      }, { status: 400 })
    }

    // Validate signature data is not empty (for drawn signatures)
    if (signatureData.type === 'drawn' && signatureData.data.length < 100) {
      return NextResponse.json({ 
        error: 'Signature appears to be empty or too small' 
      }, { status: 400 })
    }

    // Generate hash for signature integrity
    const signatureHash = createHash('sha256').update(signatureData.data).digest('hex')

    // Check if signature with this hash already exists for user
    const existingSignature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.userId, session.user.email),
        eq(signatures.hash, signatureHash)
      ))
      .limit(1)

    if (existingSignature.length > 0) {
      return NextResponse.json({ 
        error: 'A signature with identical content already exists',
        existingSignatureId: existingSignature[0].id
      }, { status: 409 })
    }

    // Get client info for audit trail
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Save signature to database
    await db.insert(signatures).values({
      id: signatureData.id,
      userId: session.user.email,
      name: signatureData.name,
      signatureType: signatureData.type,
      data: signatureData.data,
      hash: signatureHash,
      signatureMetadata: {
        ...signatureData.metadata,
        createdViaAPI: true,
        userAgent: userAgent.substring(0, 500) // Limit length
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'signature',
      eventAction: 'signature_created',
      resourceType: 'signature',
      resourceId: signatureData.id,
      eventData: {
        signatureType: signatureData.type,
        signatureName: signatureData.name,
        signatureHash,
        hasMetadata: !!signatureData.metadata
      },
      ipAddress,
      userAgent,
      eventTime: new Date()
    })

    return NextResponse.json({
      success: true,
      message: 'Signature created successfully',
      signature: {
        id: signatureData.id,
        name: signatureData.name,
        type: signatureData.type,
        hash: signatureHash,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating signature:', error)
    return NextResponse.json(
      { error: 'Failed to create signature' },
      { status: 500 }
    )
  }
}

// DELETE - Remove signature
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const signatureId = searchParams.get('id')

    if (!signatureId) {
      return NextResponse.json({ 
        error: 'Signature ID is required' 
      }, { status: 400 })
    }

    // Verify signature belongs to user
    const signature = await db.select()
      .from(signatures)
      .where(and(
        eq(signatures.id, signatureId),
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

    // Delete signature
    await db.delete(signatures)
      .where(and(
        eq(signatures.id, signatureId),
        eq(signatures.userId, session.user.email)
      ))

    // Create audit event
    await db.insert(auditEvents).values({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: session.user.email,
      eventType: 'signature',
      eventAction: 'signature_deleted',
      resourceType: 'signature',
      resourceId: signatureId,
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