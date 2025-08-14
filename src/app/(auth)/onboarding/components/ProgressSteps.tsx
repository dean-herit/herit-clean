'use client'

import { CheckCircleIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

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
    <nav aria-label="Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step, stepIdx) => {
          const isCompleted = completedSteps.includes(stepIdx)
          const isCurrent = stepIdx === currentStep
          const isClickable = stepIdx <= Math.max(...completedSteps, -1) + 1
          const Icon = step.icon

          return (
            <li key={step.id} className="md:flex-1">
              <button
                onClick={() => isClickable && onStepClick(stepIdx)}
                disabled={!isClickable}
                className={`group flex flex-col w-full text-left transition-colors ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {isCompleted ? (
                  // Completed Step
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                        Step {stepIdx + 1} - Completed
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.name}
                      </p>
                    </div>
                  </div>
                ) : isCurrent ? (
                  // Current Step
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-medium text-blue-600">
                        Step {stepIdx + 1} - Current
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Upcoming Step
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {stepIdx + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Step {stepIdx + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {step.name}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Progress Bar - Only show between steps on desktop */}
                {stepIdx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-8 flex items-center">
                    <ChevronRightIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </button>
            </li>
          )
        })}
      </ol>
      
      {/* Mobile Progress Bar */}
      <div className="md:hidden mt-6">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{completedSteps.length} of {steps.length} completed</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </nav>
  )
}