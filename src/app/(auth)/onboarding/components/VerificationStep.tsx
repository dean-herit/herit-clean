'use client'

import { useState, useEffect } from 'react'
import { ArrowRightIcon, ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface VerificationStepProps {
  loading: boolean
  onComplete: (data: any) => void
  onBack?: () => void
}

type VerificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export default function VerificationStep({
  loading,
  onComplete,
  onBack,
}: VerificationStepProps) {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending')
  const [error, setError] = useState('')
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)

  // Check existing verification status on mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        setLoadingStatus(true)
        const response = await fetch('/api/onboarding/verification-status')
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'verified') {
            setVerificationStatus('completed')
            // Auto-complete if already verified
            setTimeout(() => {
              onComplete({ verified: true, method: 'existing' })
            }, 1000)
          } else if (data.status === 'in_progress' && data.verification_url) {
            setVerificationStatus('in_progress')
            setVerificationUrl(data.verification_url)
            // Continue polling for existing session
            startPolling(data.verification_url)
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error)
      } finally {
        setLoadingStatus(false)
      }
    }

    checkVerificationStatus()
  }, [])

  // Polling function for verification status
  const startPolling = (verificationUrl?: string) => {
    const pollForCompletion = setInterval(async () => {
      try {
        const statusResponse = await fetch('/api/onboarding/verification-status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          
          if (statusData.status === 'verified') {
            clearInterval(pollForCompletion)
            setVerificationStatus('completed')
            
            // Complete onboarding
            setTimeout(() => {
              onComplete({ verified: true, method: 'stripe' })
            }, 1000)
          } else if (statusData.status === 'failed') {
            clearInterval(pollForCompletion)
            setVerificationStatus('failed')
            setError('Identity verification failed. Please try again.')
          }
        }
      } catch (error) {
        console.error('Error polling verification status:', error)
      }
    }, 2000)
    
    // Clear polling after 10 minutes
    setTimeout(() => {
      clearInterval(pollForCompletion)
    }, 10 * 60 * 1000)
    
    return pollForCompletion
  }
  
  // Start verification process
  const startVerification = async () => {
    setVerificationStatus('in_progress')
    setError('')
    
    try {
      // Check if we should use mock verification (for development)
      const useMock = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      
      if (useMock) {
        // Mock verification - simulate the process
        setTimeout(() => {
          setVerificationStatus('completed')
          // Auto-complete after showing success
          setTimeout(() => {
            onComplete({ verified: true, method: 'mock' })
          }, 2000)
        }, 3000)
        return
      }
      
      // Real Stripe Identity verification
      const response = await fetch('/api/onboarding/start-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to start verification')
      }
      
      const data = await response.json()
      
      if (data.verification_url) {
        setVerificationUrl(data.verification_url)
        
        // Open verification in new window
        const verificationWindow = window.open(
          data.verification_url,
          'identity_verification',
          'width=600,height=800,scrollbars=yes,resizable=yes'
        )
        
        // Start polling for completion
        startPolling(data.verification_url)
        
      } else {
        throw new Error('No verification URL received')
      }
      
    } catch (error) {
      console.error('Verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to start verification')
      setVerificationStatus('failed')
    }
  }
  
  // Reset and try again
  const resetVerification = () => {
    setVerificationStatus('pending')
    setError('')
    setVerificationUrl(null)
  }
  
  // Skip verification (development only)
  const skipVerification = () => {
    if (process.env.NODE_ENV === 'development') {
      onComplete({ verified: true, method: 'skipped' })
    }
  }
  
  // Show loading state while checking verification status
  if (loadingStatus) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            Checking Verification Status
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Please wait while we check your identity verification status...
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Identity Verification Required
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          We need to verify your identity to ensure the legal validity of your will. This process takes just a few minutes and includes document verification.
        </p>
      </div>
      
      {/* Verification Status */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        {verificationStatus === 'pending' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheckIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white">
                Ready to Verify
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Click the button below to start the secure verification process
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={startVerification}
                disabled={loading}
                className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Verification'}
                <ShieldCheckIcon className="w-4 h-4" />
              </button>
              
              {/* Development skip option */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={skipVerification}
                  className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Skip Verification (Development Only)
                </button>
              )}
            </div>
          </div>
        )}
        
        {verificationStatus === 'in_progress' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h4 className="text-base font-medium text-blue-600 dark:text-blue-400">
                Verification In Progress
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {verificationUrl 
                  ? "Please complete the verification in the popup window. This may take a few minutes."
                  : "Setting up your verification session..."
                }
              </p>
            </div>
            {verificationUrl && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  If the popup was blocked, you can open the verification manually:
                </p>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-500 underline"
                >
                  Open Verification Window
                </a>
              </div>
            )}
          </div>
        )}
        
        {verificationStatus === 'completed' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="text-base font-medium text-green-600 dark:text-green-400">
                Verification Completed!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Your identity has been successfully verified. You'll be redirected to your dashboard shortly.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Completing setup...</span>
            </div>
          </div>
        )}
        
        {verificationStatus === 'failed' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="text-base font-medium text-red-600 dark:text-red-400">
                Verification Failed
              </h4>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Don't worry, you can try again. Make sure you have a valid government-issued ID ready.
              </p>
            </div>
            <button
              onClick={resetVerification}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Try Again
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Information Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          What you'll need:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• A valid government-issued photo ID (passport, driving licence, national ID card)</li>
          <li>• A smartphone or computer with a camera</li>
          <li>• Good lighting for clear photos</li>
          <li>• About 2-3 minutes to complete the process</li>
        </ul>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between pt-6">
        {onBack && verificationStatus === 'pending' && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <div className="ml-auto">
          {verificationStatus === 'pending' && (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
              This is the final step of your onboarding process
            </p>
          )}
        </div>
      </div>
    </div>
  )
}