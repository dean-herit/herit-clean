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
    <nav aria-label="Progress" className="mb-12">
      {/* Desktop Progress Steps */}
      <ol className="hidden md:flex md:items-center md:justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(stepIdx)
          const isCurrent = stepIdx === currentStep
          const isClickable = stepIdx <= Math.max(...completedSteps, -1) + 1

          return (
            <li key={step.id} className="relative flex-1">
              <button
                onClick={() => isClickable && onStepClick(stepIdx)}
                disabled={!isClickable}
                className={`group w-full text-center transition-all duration-200 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      isCompleted
                        ? 'bg-blue-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <span>{stepIdx + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 max-w-24">
                    <p
                      className={`text-sm font-medium transition-colors ${
                        isCompleted || isCurrent
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
              </button>

              {/* Connection Line */}
              {stepIdx < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-px bg-slate-700 -z-10" 
                     style={{ transform: 'translateX(50%)', width: 'calc(100% - 2rem)' }} />
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
              className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                isCurrent
                  ? 'bg-blue-600/10 border-blue-600/20'
                  : isCompleted
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-800 border-slate-700 opacity-60'
              } ${isClickable ? 'cursor-pointer hover:border-slate-600' : 'cursor-not-allowed'}`}
            >
              <div className="flex items-center space-x-3">
                {/* Step Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    <span>{stepIdx + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      isCompleted || isCurrent ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {step.name}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-slate-300 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          )
        })}

        {/* Mobile Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedSteps.length} of {steps.length} completed</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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