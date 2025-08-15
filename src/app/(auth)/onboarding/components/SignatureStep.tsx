'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowRightIcon, PencilIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline'

interface PersonalInfo {
  first_name: string
  last_name: string
  email: string
}

interface Signature {
  id: string
  name: string
  data: string // base64 image data or URL
  type: 'drawn' | 'uploaded' | 'template'
  createdAt: string
}

interface SignatureStepProps {
  personalInfo: PersonalInfo
  initialSignature: Signature | null
  loading: boolean
  onChange: (signature: Signature | null) => void
  onComplete: (signature: Signature) => void
  onBack?: () => void
}

export default function SignatureStep({
  personalInfo,
  initialSignature,
  loading,
  onChange,
  onComplete,
  onBack,
}: SignatureStepProps) {
  const [selectedSignature, setSelectedSignature] = useState<Signature | null>(initialSignature)
  const [existingSignatures, setExistingSignatures] = useState<Signature[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingSignature, setSavingSignature] = useState(false)
  const [loadingSignatures, setLoadingSignatures] = useState(true)
  const [error, setError] = useState('')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDrawingRef = useRef(false)
  
  // Load existing signatures on mount
  useEffect(() => {
    const fetchExistingSignatures = async () => {
      try {
        setLoadingSignatures(true)
        const response = await fetch('/api/onboarding/signatures')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.signatures) {
            setExistingSignatures(data.signatures)
            // If no initial signature selected, try to use the most recent
            if (!selectedSignature && data.signatures.length > 0) {
              const mostRecent = data.signatures[0] // Assuming API returns sorted by most recent
              setSelectedSignature(mostRecent)
            }
          }
        }
      } catch (error) {
        console.error('Error loading signatures:', error)
      } finally {
        setLoadingSignatures(false)
      }
    }

    fetchExistingSignatures()
  }, [])

  // Update parent when signature changes
  useEffect(() => {
    onChange(selectedSignature)
  }, [selectedSignature, onChange])
  
  // Generate template signatures
  const [templates] = useState<Signature[]>(() => {
    const fullName = `${personalInfo.first_name} ${personalInfo.last_name}`
    const baseDate = new Date().toISOString()
    
    return [
      {
        id: 'template-1',
        name: fullName,
        data: generateTextSignature(fullName, 'cursive'),
        type: 'template',
        createdAt: baseDate,
      },
      {
        id: 'template-2',
        name: fullName,
        data: generateTextSignature(fullName, 'elegant'),
        type: 'template',
        createdAt: baseDate,
      },
      {
        id: 'template-3',
        name: fullName,
        data: generateTextSignature(fullName, 'formal'),
        type: 'template',
        createdAt: baseDate,
      },
    ]
  })

  // Handle template selection (save to backend)
  const selectTemplate = async (template: Signature) => {
    setSavingSignature(true)
    setError('')
    
    try {
      const response = await fetch('/api/onboarding/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          data: template.data,
          type: 'template',
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save template signature')
      }
      
      const result = await response.json()
      if (result.success && result.signature) {
        const newSignature = result.signature
        setSelectedSignature(newSignature)
        setExistingSignatures(prev => [newSignature, ...prev])
      } else {
        throw new Error(result.error || 'Failed to save template signature')
      }
      
    } catch (error) {
      console.error('Error saving template:', error)
      setError(error instanceof Error ? error.message : 'Failed to save template signature')
    } finally {
      setSavingSignature(false)
    }
  }
  
  // Initialize canvas for drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 200
    
    // Configure drawing context
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    
    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [isDrawing])
  
  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    isDrawingRef.current = true
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  
  const stopDrawing = () => {
    isDrawingRef.current = false
  }
  
  // Save drawn signature
  const saveDrawnSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    setSavingSignature(true)
    setError('')
    
    try {
      const dataURL = canvas.toDataURL('image/png')
      
      // Save signature to backend
      const response = await fetch('/api/onboarding/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${personalInfo.first_name} ${personalInfo.last_name}`,
          data: dataURL,
          type: 'drawn',
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save signature')
      }
      
      const result = await response.json()
      if (result.success && result.signature) {
        const newSignature = result.signature
        setSelectedSignature(newSignature)
        setExistingSignatures(prev => [newSignature, ...prev])
        setIsDrawing(false)
      } else {
        throw new Error(result.error || 'Failed to save signature')
      }
      
    } catch (error) {
      console.error('Error saving drawn signature:', error)
      setError(error instanceof Error ? error.message : 'Failed to save signature')
    } finally {
      setSavingSignature(false)
    }
  }
  
  // Clear canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  
  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }
    
    setUploading(true)
    setError('')
    
    try {
      // Upload image to get URL
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await fetch('/api/upload/signature-image', {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }
      
      const uploadResult = await uploadResponse.json()
      
      // Save signature to backend
      const response = await fetch('/api/onboarding/signatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${personalInfo.first_name} ${personalInfo.last_name}`,
          data: uploadResult.url,
          type: 'uploaded',
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save signature')
      }
      
      const result = await response.json()
      if (result.success && result.signature) {
        const newSignature = result.signature
        setSelectedSignature(newSignature)
        setExistingSignatures(prev => [newSignature, ...prev])
      } else {
        throw new Error(result.error || 'Failed to save signature')
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload signature')
    } finally {
      setUploading(false)
    }
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSignature) {
      setError('Please create or select a signature')
      return
    }
    
    onComplete(selectedSignature)
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Create Your Digital Signature
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Your signature will be used to sign legal documents. Choose from templates, draw your own, or upload an image.
        </p>
      </div>
      
      {/* Legal Name Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
          Legal Name for Signature
        </h4>
        <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          {personalInfo.first_name} {personalInfo.last_name}
        </p>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loadingSignatures ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading your signatures...</p>
        </div>
      ) : (
        <>
          {/* Existing Signatures */}
          {existingSignatures.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white mb-4">
                Your Saved Signatures
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {existingSignatures.map((signature) => (
                  <button
                    key={signature.id}
                    type="button"
                    onClick={() => setSelectedSignature(signature)}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      selectedSignature?.id === signature.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="bg-white dark:bg-slate-800 rounded p-3 min-h-[80px] flex items-center justify-center">
                      <img
                        src={signature.data}
                        alt={signature.name}
                        className="max-w-full h-auto object-contain"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {signature.type} • {new Date(signature.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Signature Creation Options */}
          <div className="space-y-6">
            {/* Template Signatures */}
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white mb-4">
                Choose from Templates
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => selectTemplate(template)}
                    disabled={savingSignature}
                    className={`p-4 border-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedSignature?.data === template.data
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <div className="bg-white dark:bg-slate-800 rounded p-3 min-h-[80px] flex items-center justify-center">
                      {savingSignature ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      ) : (
                        <img
                          src={template.data}
                          alt={template.name}
                          className="max-w-full h-auto object-contain"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Draw Signature */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-medium text-slate-900 dark:text-white">
                  Draw Your Signature
                </h4>
                <button
                  type="button"
                  onClick={() => setIsDrawing(!isDrawing)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
                </button>
              </div>
              
              {isDrawing && (
                <div className="space-y-4">
                  <div className="border-2 border-slate-300 dark:border-slate-600 rounded-lg">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-48 cursor-crosshair rounded-lg"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={saveDrawnSignature}
                      disabled={savingSignature}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingSignature ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <PencilIcon className="w-4 h-4" />
                          Save Signature
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Upload Signature */}
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white mb-4">
                Upload Signature Image
              </h4>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-slate-600 dark:text-slate-400">Processing...</span>
                  </div>
                ) : (
                  <>
                    <PhotoIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                    <p className="text-slate-600 dark:text-slate-400">
                      Click to upload your signature
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>
        </>
      )}
      
      {/* Selected Signature Preview */}
      {selectedSignature && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h4 className="text-base font-medium text-slate-900 dark:text-white mb-4">
            Selected Signature
          </h4>
          <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
            <img
              src={selectedSignature.data}
              alt="Selected signature"
              className="w-full max-h-24 object-contain"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="font-medium">{selectedSignature.name}</p>
              <p>Created: {new Date(selectedSignature.createdAt).toLocaleDateString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSignature(null)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      )}
      
      {/* Submit Button */}
      <div className="flex justify-between pt-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !selectedSignature}
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// Helper function to generate text-based signature images
function generateTextSignature(name: string, style: 'cursive' | 'elegant' | 'formal'): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = 400
  canvas.height = 100
  
  if (!ctx) return ''
  
  // Fill with white background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Set font based on style
  let font = '36px '
  switch (style) {
    case 'cursive':
      font += 'cursive'
      break
    case 'elegant':
      font += 'serif'
      break
    case 'formal':
      font += 'Arial, sans-serif'
      break
  }
  
  ctx.font = font
  ctx.fillStyle = '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Apply style-specific transformations
  if (style === 'cursive') {
    ctx.transform(1, 0, -0.1, 1, 0, 0) // Slight italic
  }
  
  ctx.fillText(name, canvas.width / 2, canvas.height / 2)
  
  return canvas.toDataURL('image/png')
}