'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { BackgroundLayout } from '@/components/ui/BackgroundLayout'
import { Header } from '@/components/ui/Header'

// Prevent static generation for auth pages
export const dynamic = 'force-dynamic'

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
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      </BackgroundLayout>
    )
  }

  return (
    <BackgroundLayout>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg shadow-sm">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-black/30 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-light text-white mb-2">Welcome back</h1>
              <p className="text-white/70 font-sans text-base">Sign in to continue to your estate planning</p>
            </div>
            <LoginForm onSignIn={handleSignIn} />
          </div>
        </div>
      </div>
    </BackgroundLayout>
  )
}