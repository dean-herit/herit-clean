'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            // Primary variant
            'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500':
              variant === 'primary',
            // Secondary variant  
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500':
              variant === 'secondary',
            // Outline variant
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500':
              variant === 'outline',
            // Ghost variant
            'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
            // Destructive variant
            'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500':
              variant === 'destructive',
          },
          {
            // Small size
            'h-8 px-3 text-sm': size === 'sm',
            // Medium size (default)
            'h-10 px-4 py-2': size === 'md',
            // Large size
            'h-12 px-8 py-3 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }