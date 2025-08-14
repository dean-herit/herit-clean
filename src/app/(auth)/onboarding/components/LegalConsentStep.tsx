'use client'

import { useState, useEffect } from 'react'
import { ArrowRightIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Signature {
  id: string
  name: string
  data: string
  type: 'drawn' | 'uploaded' | 'template'
  createdAt: string
}

interface LegalDocument {
  id: string
  title: string
  content: string
  required: boolean
  category: string
  version: string
}

interface LegalConsentStepProps {
  signature: Signature
  initialConsents: string[]
  loading: boolean
  onChange: (consents: string[]) => void
  onComplete: (consents: string[]) => void
  onBack?: () => void
}

export default function LegalConsentStep({
  signature,
  initialConsents,
  loading,
  onChange,
  onComplete,
  onBack,
}: LegalConsentStepProps) {
  const [signedConsents, setSignedConsents] = useState<string[]>(initialConsents)
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null)
  const [signingDocument, setSigningDocument] = useState<string | null>(null)
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [error, setError] = useState('')
  
  // Load legal documents on mount
  useEffect(() => {
    const fetchLegalDocuments = async () => {
      try {
        setLoadingDocuments(true)
        const response = await fetch('/api/onboarding/legal-consent')
        if (response.ok) {
          const data = await response.json()
          setLegalDocuments(data.disclaimers || [])
          // If user has existing consents, load them
          if (data.userConsents?.consents) {
            setSignedConsents(data.userConsents.consents)
          }
        } else {
          throw new Error('Failed to load legal documents')
        }
      } catch (error) {
        console.error('Error loading legal documents:', error)
        setError('Failed to load legal documents. Please refresh the page.')
      } finally {
        setLoadingDocuments(false)
      }
    }

    fetchLegalDocuments()
  }, [])

  // Update parent when consents change
  useEffect(() => {
    onChange(signedConsents)
  }, [signedConsents, onChange])
  
  // Check if document is signed
  const isDocumentSigned = (documentId: string) => {
    return signedConsents.includes(documentId)
  }
  
  // Check if all required documents are signed
  const allRequiredSigned = () => {
    const requiredDocs = legalDocuments.filter(doc => doc.required)
    return requiredDocs.every(doc => signedConsents.includes(doc.id))
  }
  
  // Toggle document expansion
  const toggleDocument = (documentId: string) => {
    setExpandedDocument(expandedDocument === documentId ? null : documentId)
  }
  
  // Sign a document
  const signDocument = async (documentId: string) => {
    if (signingDocument || isDocumentSigned(documentId)) return
    
    setSigningDocument(documentId)
    setError('')
    
    try {
      // Add to signed consents immediately for UI feedback
      setSignedConsents(prev => [...prev, documentId])
      
      // Show success animation by keeping signingDocument for a moment
      setTimeout(() => {
        setSigningDocument(null)
      }, 1000)
      
    } catch (error) {
      console.error('Error signing document:', error)
      setError('Failed to sign document. Please try again.')
      setSigningDocument(null)
      // Remove from signed consents if there was an error
      setSignedConsents(prev => prev.filter(id => id !== documentId))
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!allRequiredSigned()) {
      setError('Please sign all required legal agreements to continue')
      return
    }
    
    try {
      // Save legal consents to backend
      const response = await fetch('/api/onboarding/legal-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consents: signedConsents,
          timestamp: new Date().toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save legal consents')
      }
      
      // Complete this step
      onComplete(signedConsents)
      
    } catch (error) {
      console.error('Error saving legal consents:', error)
      setError(error instanceof Error ? error.message : 'Failed to save legal consents. Please try again.')
    }
  }
  
  const progress = signedConsents.length
  const totalRequired = legalDocuments.filter(doc => doc.required).length
  
  // Show loading state while documents are being fetched
  if (loadingDocuments) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Loading Legal Agreements
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please wait while we prepare your legal documents...
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    )
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Legal Agreements
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please review and sign each legal agreement using your digital signature
        </p>
      </div>
      
      {/* Selected Signature Display */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Signing with: {signature.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created {new Date(signature.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <img
              src={signature.data}
              alt={signature.name}
              className="w-24 h-8 object-contain dark:invert"
            />
          </div>
        </div>
      </div>
      
      {/* Progress Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Progress: {progress} of {totalRequired} required agreements signed
          </span>
          {allRequiredSigned() && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Complete!</span>
            </div>
          )}
        </div>
        <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress / totalRequired) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {/* Legal Documents */}
      <div className="space-y-4">
        {legalDocuments.map((document) => {
          const isSigned = isDocumentSigned(document.id)
          const isExpanded = expandedDocument === document.id
          const isSigning = signingDocument === document.id
          
          return (
            <div
              key={document.id}
              className={`border rounded-lg transition-all ${
                isSigned
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Document Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                        {document.title}
                        {document.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </h4>
                      {isSigned && (
                        <div className="flex items-center space-x-1">
                          <CheckIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">Signed</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => toggleDocument(document.id)}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {isExpanded ? (
                      <>
                        Hide <ChevronUpIcon className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Read Agreement <ChevronDownIcon className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {document.content}
                      </div>
                      {document.version && (
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Version: {document.version} | Category: {document.category}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Signature Section */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  {isSigned ? (
                    <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Agreement Signed
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        <img
                          src={signature.data}
                          alt="Signature"
                          className="w-20 h-6 object-contain dark:invert"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>By clicking "Sign Agreement", you agree to the terms above</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Click to sign this agreement
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => signDocument(document.id)}
                          disabled={isSigning}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSigning ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Signing...
                            </>
                          ) : (
                            <>
                              <DocumentTextIcon className="w-4 h-4 mr-2" />
                              Sign Agreement
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
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
          disabled={loading || !allRequiredSigned()}
          className="ml-auto inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}