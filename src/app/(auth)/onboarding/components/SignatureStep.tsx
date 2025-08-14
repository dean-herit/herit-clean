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
  data: string // base64 image data
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
  const [isDrawing, setIsDrawing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDrawingRef = useRef(false)
  
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
  
  // Update parent when signature changes
  useEffect(() => {
    onChange(selectedSignature)
  }, [selectedSignature, onChange])
  
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
  const saveDrawnSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataURL = canvas.toDataURL('image/png')
    const signature: Signature = {
      id: `drawn-${Date.now()}`,
      name: `${personalInfo.first_name} ${personalInfo.last_name}`,
      data: dataURL,
      type: 'drawn',
      createdAt: new Date().toISOString(),
    }
    
    setSelectedSignature(signature)
    setIsDrawing(false)
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
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataURL = e.target?.result as string
        const signature: Signature = {
          id: `uploaded-${Date.now()}`,
          name: `${personalInfo.first_name} ${personalInfo.last_name}`,
          data: dataURL,
          type: 'uploaded',
          createdAt: new Date().toISOString(),
        }
        
        setSelectedSignature(signature)
        setUploading(false)
      }
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload signature')
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Create Your Digital Signature
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
      
      {/* Signature Creation Options */}
      <div className="space-y-6">
        {/* Template Signatures */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Choose from Templates
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedSignature(template)}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedSignature?.id === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="bg-white dark:bg-gray-800 rounded p-3 min-h-[80px] flex items-center justify-center">
                  <img
                    src={template.data}
                    alt={template.name}
                    className="max-w-full h-auto object-contain"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Draw Signature */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-gray-900 dark:text-white">
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
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg">
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
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={saveDrawnSignature}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <PencilIcon className="w-4 h-4" />
                  Save Signature
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Upload Signature */}
        <div>
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Upload Signature Image
          </h4>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Processing...</span>
              </div>
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Click to upload your signature
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
      
      {/* Selected Signature Preview */}
      {selectedSignature && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Selected Signature
          </h4>
          <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <img
              src={selectedSignature.data}
              alt="Selected signature"
              className="w-full max-h-24 object-contain"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
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
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
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