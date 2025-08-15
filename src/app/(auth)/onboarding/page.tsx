'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon, CheckCircleIcon, UserIcon, PencilSquareIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import OnboardingSidebar from '@/components/ui/OnboardingSidebar'

// Force dynamic rendering for user-specific onboarding
export const dynamic = 'force-dynamic'

// Import step components
import PersonalInfoStep from './components/PersonalInfoStep'
import SignatureStep from './components/SignatureStep'
import LegalConsentStep from './components/LegalConsentStep'
import VerificationStep from './components/VerificationStep'

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
            <p className="text-slate-600">Please complete the signature step first.</p>
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
    <div className="min-h-screen bg-theme-bg">
      <OnboardingSidebar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
        onNext={() => {
          if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
          }
        }}
        onStepChange={goToStep}
      >
        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-8 bg-theme-danger/10 border border-theme-danger/20 text-theme-danger px-6 py-4 rounded-theme-xl">
            <div className="font-medium mb-2">Please correct the following errors:</div>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm font-normal">• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Step Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-theme-brand rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold">
                  {currentStep + 1}
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-theme-text">
                {STEPS[currentStep].name}
              </h1>
              <p className="text-sm text-theme-text-muted mt-1 font-normal">
                {STEPS[currentStep].description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-theme-card rounded-theme-2xl border border-theme-input-border shadow-theme-card p-8">
          {renderCurrentStep()}
        </div>
      </OnboardingSidebar>
    </div>
  )
}