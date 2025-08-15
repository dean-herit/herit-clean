'use client'

import React from 'react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import VerticalSteps from './VerticalSteps'

export type OnboardingSidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  currentStep: number
  onBack: () => void
  onNext: () => void
  onStepChange: (step: number) => void
  completedSteps: number[]
}

function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]): string {
  return classes
    .map(cls => {
      if (typeof cls === 'object' && cls !== null) {
        return Object.entries(cls)
          .filter(([, condition]) => condition)
          .map(([className]) => className)
          .join(' ')
      }
      return cls
    })
    .filter(Boolean)
    .join(' ')
}

const OnboardingSidebar = React.forwardRef<HTMLDivElement, OnboardingSidebarProps>(
  ({ children, className, currentStep, onBack, onNext, onStepChange, completedSteps, ...props }, ref) => {
    const steps = [
      {
        title: "Personal Information",
        description: "Basic details and Irish address",
      },
      {
        title: "Create Signature",
        description: "Choose or create your digital signature",
      },
      {
        title: "Legal Consent",
        description: "Required legal agreements",
      },
      {
        title: "Identity Verification",
        description: "Secure identity verification",
      },
    ]

    return (
      <div
        ref={ref}
        className={cn("flex h-screen w-full gap-x-6", className)}
        {...props}
      >
        {/* Sidebar - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] shrink-0 flex-col bg-theme-surface rounded-theme-2xl m-4 p-8 gap-y-8">
          {/* Back Button */}
          <button
            className="bg-theme-card text-theme-text-muted font-medium shadow-sm rounded-full px-4 py-2 text-sm hover:bg-theme-bg transition-colors flex items-center gap-2 self-start disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentStep === 0}
            onClick={onBack}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </button>

          {/* Header */}
          <div>
            <div className="text-theme-text text-2xl leading-7 font-semibold">
              Welcome to Herit
            </div>
            <div className="text-theme-text-muted mt-2 text-base leading-6 font-normal">
              Let's get you set up with everything you need to create your will
            </div>
          </div>

          {/* Desktop Steps */}
          <VerticalSteps
            currentStep={currentStep}
            steps={steps}
            onStepChange={onStepChange}
          />

          {/* Support Card */}
          <div className="bg-theme-card/50 backdrop-blur-sm rounded-theme-xl p-6 border border-theme-input-border">
            <div className="text-theme-text font-medium text-sm mb-2">
              Need help?
            </div>
            <div className="text-theme-text-muted text-xs mb-4">
              Our support team is here to assist you with any questions about the onboarding process.
            </div>
            <button className="bg-theme-brand text-white text-xs px-4 py-2 rounded-theme-xl hover:bg-theme-accent transition-colors">
              Contact Support
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col items-center">
          {/* Mobile Progress Header */}
          <div className="lg:hidden sticky top-0 z-10 w-full bg-theme-surface/80 backdrop-blur-sm py-4 border-b border-theme-input-border">
            <div className="flex justify-center px-4">
              <div className="flex items-center gap-2">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      {
                        "bg-theme-brand": idx <= currentStep,
                        "bg-theme-input-border": idx > currentStep,
                      }
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Content Container */}
          <div className="flex-1 w-full max-w-2xl p-6 lg:p-8">
            {children}

            {/* Mobile Navigation Buttons */}
            <div className="lg:hidden flex justify-between items-center mt-8 pt-6 border-t border-theme-input-border">
              <button
                className="px-6 py-3 text-theme-text-muted hover:text-theme-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={currentStep === 0}
                onClick={onBack}
              >
                Back
              </button>
              <button
                className="px-8 py-3 bg-theme-brand text-white rounded-theme-2xl hover:bg-theme-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                onClick={onNext}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
              </button>
            </div>

            {/* Mobile Support Card */}
            <div className="lg:hidden bg-theme-card/30 rounded-theme-xl p-4 mt-6 text-center border border-theme-input-border">
              <div className="text-theme-text-muted text-xs">
                Need help? 
                <button className="text-theme-brand ml-1 hover:text-theme-accent transition-colors">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

OnboardingSidebar.displayName = "OnboardingSidebar"

export default OnboardingSidebar