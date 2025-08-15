'use client'

import { CheckIcon } from '@heroicons/react/24/solid'

interface Step {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  completedSteps: number[]
  onStepClick: (stepIndex: number) => void
}

export default function ProgressSteps({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: ProgressStepsProps) {
  return (
    <nav aria-label="Progress" className="mb-12" data-ui="stepper">
      {/* Desktop Progress Steps */}
      <ol className="hidden md:flex md:items-center md:justify-center md:space-x-8">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(stepIdx)
          const isCurrent = stepIdx === currentStep
          const isClickable = stepIdx <= Math.max(...completedSteps, -1) + 1

          return (
            <li key={step.id} className="relative">
              <button
                onClick={() => isClickable && onStepClick(stepIdx)}
                disabled={!isClickable}
                className={`group text-center transition-all duration-200 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 shadow-lg ${
                      isCompleted
                        ? 'bg-theme-brand text-white'
                        : isCurrent
                        ? 'bg-theme-brand text-white'
                        : 'bg-theme-surface text-theme-text-muted border border-theme-input-border group-hover:bg-theme-card'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <span className="font-semibold">{stepIdx + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-4 max-w-32">
                    <p
                      className={`text-sm font-medium transition-colors text-center ${
                        isCompleted || isCurrent
                          ? 'text-theme-text'
                          : 'text-theme-text-muted group-hover:text-theme-text'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
              </button>

              {/* Connection Line */}
              {stepIdx < steps.length - 1 && (
                <div className="absolute top-6 left-full w-8 h-px bg-theme-input-border -z-10" />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile Progress Steps */}
      <div className="md:hidden space-y-4">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(stepIdx)
          const isCurrent = stepIdx === currentStep
          const isClickable = stepIdx <= Math.max(...completedSteps, -1) + 1

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(stepIdx)}
              disabled={!isClickable}
              className={`w-full text-left p-4 rounded-theme-xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-theme-brand/10 border-theme-brand/20'
                  : isCompleted
                  ? 'bg-theme-card border-theme-input-border'
                  : 'bg-theme-card border-theme-input-border opacity-60'
              } ${isClickable ? 'cursor-pointer hover:border-theme-accent/30' : 'cursor-not-allowed'}`}
            >
              <div className="flex items-center space-x-3">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-theme-brand text-white'
                      : isCurrent
                      ? 'bg-theme-brand text-white'
                      : 'bg-theme-surface text-theme-text-muted border border-theme-input-border'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{stepIdx + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCompleted || isCurrent ? 'text-theme-text' : 'text-theme-text-muted'
                    }`}
                  >
                    {step.name}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-theme-text-muted mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {/* Mobile Progress Bar */}
        <div className="mt-6 pt-4 border-t border-theme-input-border">
          <div className="flex justify-between text-xs text-theme-text-muted mb-2">
            <span>Progress</span>
            <span>{completedSteps.length} of {steps.length} completed</span>
          </div>
          <div className="w-full bg-theme-input-border rounded-full h-2">
            <div
              className="bg-theme-brand h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(completedSteps.length / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}