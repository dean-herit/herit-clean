import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { put } from '@vercel/blob'
import { db } from '@/db/db'
import { auditEvents } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (2MB limit for signatures)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Signature image must be less than 2MB' 
      }, { status: 400 })
    }

    // Generate unique filename for signature
    const fileExtension = file.name.split('.').pop() || 'png'
    const signatureId = `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileName = `signatures/${session.user.email.replace('@', '_at_')}/${signatureId}.${fileExtension}`

    try {
      // Upload to Vercel Blob with public access (will be secured via API)
      const blob = await put(fileName, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      })

      // Get client info for audit trail
      const ipAddress = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      // Create audit event
      await db.insert(auditEvents).values({
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: session.user.email,
        eventType: 'upload',
        eventAction: 'signature_image_uploaded',
        resourceType: 'signature_image',
        resourceId: blob.url,
        eventData: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          blobUrl: blob.url,
          signatureId,
          uploadedViaAPI: true
        },
        ipAddress,
        userAgent,
        eventTime: new Date()
      })

      return NextResponse.json({
        success: true,
        url: blob.url,
        signatureId,
        message: 'Signature image uploaded successfully'
      })
    } catch (blobError) {
      console.error('Vercel Blob upload error:', blobError)
      
      // Fallback to base64 if Vercel Blob fails (development/testing)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataURL = `data:${file.type};base64,${base64}`
      
      console.warn('Falling back to base64 due to Blob upload failure')
      
      return NextResponse.json({
        success: true,
        url: dataURL,
        signatureId: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: 'Signature image uploaded successfully (base64 fallback)',
        fallback: true
      })
    }

  } catch (error) {
    console.error('Error uploading signature image:', error)
    return NextResponse.json(
      { error: 'Failed to upload signature image' },
      { status: 500 }
    )
  }
}