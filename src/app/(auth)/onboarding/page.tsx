'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, CheckCircleIcon, UserIcon, PencilSquareIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// Force dynamic rendering for user-specific onboarding
export const dynamic = 'force-dynamic'

// Import step components
import PersonalInfoStep from './components/PersonalInfoStep'
import SignatureStep from './components/SignatureStep'
import LegalConsentStep from './components/LegalConsentStep'
import VerificationStep from './components/VerificationStep'
import ProgressSteps from './components/ProgressSteps'

// Types
type Signature = {
  id: string
  name: string
  data: string
  type: 'drawn' | 'uploaded' | 'template'
  createdAt: string
}

interface OnboardingProgress {
  currentStep: number
  personalInfo: any
  signature: Signature | null
  consents: string[]
  completedSteps: number[]
}

const STEPS = [
  {
    id: 'personal_info',
    name: 'Personal Information',
    description: 'Basic details and Irish address',
    icon: UserIcon,
  },
  {
    id: 'signature',
    name: 'Create Signature',
    description: 'Choose or create your digital signature',
    icon: PencilSquareIcon,
  },
  {
    id: 'legal_consent',
    name: 'Legal Consent',
    description: 'Required legal agreements',
    icon: DocumentTextIcon,
  },
  {
    id: 'verification',
    name: 'Identity Verification',
    description: 'Secure identity verification',
    icon: ShieldCheckIcon,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  
  // Main state
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // Step data
  const [personalInfo, setPersonalInfo] = useState({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: '',
    phone_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    county: '',
    eircode: '',
    profile_photo: null as string | null,
  })
  
  const [signature, setSignature] = useState<Signature | null>(null)
  const [consents, setConsents] = useState<string[]>([])
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('onboarding-progress')
    if (savedProgress) {
      try {
        const progress: OnboardingProgress = JSON.parse(savedProgress)
        setCurrentStep(progress.currentStep || 0)
        setPersonalInfo(progress.personalInfo || personalInfo)
        setSignature(progress.signature || null)
        setConsents(progress.consents || [])
        setCompletedSteps(progress.completedSteps || [])
      } catch (error) {
        console.error('Error loading onboarding progress:', error)
      }
    }
    
    // Try to populate from user session
    fetchUserData()
  }, [])
  
  // Save progress to localStorage whenever state changes
  useEffect(() => {
    const progress: OnboardingProgress = {
      currentStep,
      personalInfo,
      signature,
      consents,
      completedSteps,
    }
    localStorage.setItem('onboarding-progress', JSON.stringify(progress))
  }, [currentStep, personalInfo, signature, consents, completedSteps])
  
  // Fetch user data from session
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setPersonalInfo(prev => ({
            ...prev,
            first_name: data.user.given_name || prev.first_name,
            last_name: data.user.family_name || prev.last_name,
            email: data.user.email || prev.email,
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }
  
  // Handle step completion
  const handleStepComplete = async (stepIndex: number, stepData: any) => {
    setErrors([])
    setLoading(true)
    
    try {
      // Save step data to backend
      const response = await fetch('/api/onboarding/save-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: stepIndex,
          data: stepData,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save step data')
      }
      
      // Update local state based on step
      switch (stepIndex) {
        case 0:
          setPersonalInfo(stepData)
          break
        case 1:
          setSignature(stepData)
          break
        case 2:
          setConsents(stepData)
          break
        case 3:
          // Verification completed - redirect to dashboard
          completeOnboarding()
          return
      }
      
      // Mark step as completed and move to next step
      setCompletedSteps(prev => [...prev.filter(s => s !== stepIndex), stepIndex])
      
      if (stepIndex < STEPS.length - 1) {
        setCurrentStep(stepIndex + 1)
      }
      
    } catch (error) {
      console.error('Error completing step:', error)
      setErrors([error instanceof Error ? error.message : 'Failed to save step'])
    } finally {
      setLoading(false)
    }
  }
  
  // Complete onboarding and redirect to dashboard
  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
      })
      
      if (response.ok) {
        // Clear onboarding progress
        localStorage.removeItem('onboarding-progress')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('Failed to complete onboarding')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setErrors(['Failed to complete onboarding. Please try again.'])
    }
  }
  
  // Navigate between steps
  const goToStep = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, -1) + 1) {
      setCurrentStep(stepIndex)
    }
  }
  
  // Render current step component
  const renderCurrentStep = () => {
    const commonProps = {
      loading,
      onComplete: (data: any) => handleStepComplete(currentStep, data),
      onBack: currentStep > 0 ? () => setCurrentStep(currentStep - 1) : undefined,
    }
    
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            {...commonProps}
            initialData={personalInfo}
            onChange={setPersonalInfo}
          />
        )
      case 1:
        return (
          <SignatureStep
            {...commonProps}
            personalInfo={personalInfo}
            initialSignature={signature}
            onChange={setSignature}
          />
        )
      case 2:
        return signature ? (
          <LegalConsentStep
            {...commonProps}
            signature={signature}
            initialConsents={consents}
            onChange={setConsents}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please complete the signature step first.</p>
          </div>
        )
      case 3:
        return (
          <VerificationStep
            {...commonProps}
          />
        )
      default:
        return null
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Herit
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Let's get you set up with everything you need to create your will
          </p>
        </div>
        
        {/* Progress Steps */}
        <ProgressSteps
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={goToStep}
        />
        
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <div className="font-medium">Please correct the following errors:</div>
            <ul className="mt-2 list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Current Step Content */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="px-8 py-6">
              {/* Step Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentStep + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {STEPS[currentStep].name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {STEPS[currentStep].description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Step Content */}
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}