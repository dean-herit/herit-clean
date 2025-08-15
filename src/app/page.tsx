'use client'

// Prevent static generation for dynamic pages with client-side routing
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // User is authenticated, redirect to dashboard
            router.push('/dashboard')
          } else {
            // Not authenticated, redirect to login
            router.push('/login')
          }
        } else {
          // Session check failed, redirect to login
          router.push('/login')
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Show loading while checking auth
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
    </div>
  )
}