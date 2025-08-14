'use client'

import { ReactNode } from 'react'

interface BackgroundLayoutProps {
  children: ReactNode
  variant?: 'hero-1' | 'hero-2'
  className?: string
}

export function BackgroundLayout({ 
  children, 
  variant = 'hero-1',
  className = '' 
}: BackgroundLayoutProps) {
  const backgroundClass = variant === 'hero-1' ? 'bg-herit-hero-1' : 'bg-herit-hero-2'
  
  return (
    <div className={`min-h-screen relative ${backgroundClass} bg-cover bg-center bg-no-repeat ${className}`}>
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}