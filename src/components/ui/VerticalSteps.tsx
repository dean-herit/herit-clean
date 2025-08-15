'use client'

import React from 'react'
import { CheckIcon } from '@heroicons/react/24/solid'

export type VerticalStepProps = {
  className?: string
  description?: React.ReactNode
  title?: React.ReactNode
}

export interface VerticalStepsProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * An array of steps.
   */
  steps?: VerticalStepProps[]
  /**
   * The current step index.
   */
  currentStep?: number
  /**
   * The default step index.
   */
  defaultStep?: number
  /**
   * Whether to hide the progress bars.
   */
  hideProgressBars?: boolean
  /**
   * The custom class for the steps wrapper.
   */
  className?: string
  /**
   * The custom class for the step.
   */
  stepClassName?: string
  /**
   * Callback function when the step index changes.
   */
  onStepChange?: (stepIndex: number) => void
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

const VerticalSteps = React.forwardRef<HTMLButtonElement, VerticalStepsProps>(
  (
    {
      steps = [],
      defaultStep = 0,
      onStepChange,
      currentStep: currentStepProp,
      hideProgressBars = false,
      stepClassName,
      className,
      ...props
    },
    ref,
  ) => {
    const [currentStep, setCurrentStep] = React.useState(
      currentStepProp ?? defaultStep
    )

    React.useEffect(() => {
      if (currentStepProp !== undefined) {
        setCurrentStep(currentStepProp)
      }
    }, [currentStepProp])

    const handleStepClick = (stepIndex: number) => {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }

    return (
      <nav aria-label="Progress" className="max-w-fit">
        <ol className={cn("flex flex-col gap-y-3", className)}>
          {steps?.map((step, stepIdx) => {
            const status =
              currentStep === stepIdx ? "active" : currentStep < stepIdx ? "inactive" : "complete"

            return (
              <li key={stepIdx} className="relative">
                <div className="flex w-full max-w-full items-center">
                  <button
                    key={stepIdx}
                    ref={ref}
                    aria-current={status === "active" ? "step" : undefined}
                    className={cn(
                      "group rounded-theme-xl flex w-full cursor-pointer items-center justify-center gap-4 px-3 py-2.5 transition-all duration-200 hover:bg-theme-surface/30",
                      stepClassName,
                    )}
                    onClick={() => handleStepClick(stepIdx)}
                    {...props}
                  >
                    <div className="flex h-full items-center">
                      <div className="relative">
                        <div
                          className={cn(
                            "relative flex h-[34px] w-[34px] items-center justify-center rounded-full font-semibold border-2 text-sm transition-all duration-200",
                            {
                              "bg-theme-brand border-theme-brand text-white shadow-lg": status === "complete",
                              "bg-transparent border-theme-brand text-theme-brand": status === "active", 
                              "bg-transparent border-theme-input-border text-theme-text-muted": status === "inactive",
                            }
                          )}
                          data-status={status}
                        >
                          <div className="flex items-center justify-center">
                            {status === "complete" ? (
                              <CheckIcon className="h-5 w-5" />
                            ) : (
                              <span>{stepIdx + 1}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div>
                        <div
                          className={cn(
                            "font-medium transition-colors duration-200 text-sm",
                            {
                              "text-theme-text": status === "active" || status === "complete",
                              "text-theme-text-muted": status === "inactive",
                            },
                          )}
                        >
                          {step.title}
                        </div>
                        <div
                          className={cn(
                            "text-xs transition-colors duration-200 mt-1",
                            {
                              "text-theme-text-muted": status === "active" || status === "complete",
                              "text-theme-text-muted/70": status === "inactive",
                            },
                          )}
                        >
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
                {stepIdx < steps.length - 1 && !hideProgressBars && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-[52px] flex h-6 items-center px-4"
                  >
                    <div
                      className={cn(
                        "relative h-full w-0.5 transition-colors duration-200",
                        {
                          "bg-theme-brand": stepIdx < currentStep,
                          "bg-theme-input-border": stepIdx >= currentStep,
                        }
                      )}
                    />
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)

VerticalSteps.displayName = "VerticalSteps"

export default VerticalSteps