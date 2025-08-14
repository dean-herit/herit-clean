'use client'

import React from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  value: string | number
}

interface SelectProps {
  label?: string
  error?: string
  helpText?: string
  placeholder?: string
  options: Option[]
  value?: string | number
  onChange: (value: string | number) => void
  disabled?: boolean
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ label, error, helpText, placeholder = 'Select an option...', options, value, onChange, disabled = false, className }, ref) => {
    const selectedOption = options.find(option => option.value === value)
    const inputId = `select-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={cn("space-y-1", className)} ref={ref}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
        )}
        <Listbox value={value} onChange={onChange} disabled={disabled}>
          <div className="relative">
            <Listbox.Button 
              id={inputId}
              className={cn(
                "relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset focus:outline-none focus:ring-2 sm:text-sm sm:leading-6",
                error
                  ? "ring-red-300 focus:ring-red-500"
                  : "ring-gray-300 focus:ring-indigo-600",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className={cn(
                "block truncate",
                !selectedOption && "text-gray-400"
              )}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active }) =>
                      cn(
                        "relative cursor-default select-none py-2 pl-10 pr-4",
                        active ? "bg-indigo-600 text-white" : "text-gray-900"
                      )
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                          {option.label}
                        </span>
                        {selected ? (
                          <span className={cn(
                            "absolute inset-y-0 left-0 flex items-center pl-3",
                            active ? "text-white" : "text-indigo-600"
                          )}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>

        {error && (
          <p className="text-sm text-red-600" id={`${inputId}-error`}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500" id={`${inputId}-help`}>
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps, Option }