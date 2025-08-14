'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { BackgroundLayout } from '@/components/ui/BackgroundLayout'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // User is authenticated, redirect to dashboard
            router.push('/dashboard')
            return
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignIn = () => {
    // Called when sign-in is initiated
    setIsLoading(true)
  }

  if (isLoading) {
    return (
      <BackgroundLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      </BackgroundLayout>
    )
  }

  return (
    <BackgroundLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-x-3 mb-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-lg">
              <span className="text-2xl font-brand font-bold text-herit-800">H</span>
            </div>
            <span className="text-4xl font-brand font-bold text-white drop-shadow-lg">
              Herit
            </span>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg shadow-sm">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
            <LoginForm onSignIn={handleSignIn} />
          </div>
        </div>
      </div>
    </BackgroundLayout>
  )
}