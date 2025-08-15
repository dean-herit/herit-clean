'use client'

import { ReactNode, useState, useEffect } from 'react'

interface ClientQueryWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientQueryWrapper({ children, fallback }: ClientQueryWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return <>{children}</>
}