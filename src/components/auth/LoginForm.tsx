'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleSignInButton } from './GoogleSignInButton'
import { AppleSignInButton } from './AppleSignInButton'
import { EmailLoginForm } from './EmailLoginForm'
import { EmailSignupForm } from './EmailSignupForm'

interface LoginFormProps {
  onSignIn?: () => void
}

export function LoginForm({ onSignIn }: LoginFormProps) {
  const router = useRouter()
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [showEmailAuth, setShowEmailAuth] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleEmailAuthSuccess = () => {
    setAuthError(null)
    onSignIn?.()
    router.push('/dashboard')
  }

  const handleEmailAuthError = (error: string) => {
    setAuthError(error)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome to Herit
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Digital Estate Planning Made Simple
        </p>
      </div>

      {/* Error Display */}
      {authError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{authError}</p>
        </div>
      )}

      {/* Email Authentication Forms */}
      {showEmailAuth ? (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
                authMode === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
                authMode === 'signup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authMode === 'login' ? (
            <EmailLoginForm
              onSuccess={handleEmailAuthSuccess}
              onError={handleEmailAuthError}
            />
          ) : (
            <EmailSignupForm
              onSuccess={handleEmailAuthSuccess}
              onError={handleEmailAuthError}
            />
          )}

          <div className="text-center">
            <button
              onClick={() => setShowEmailAuth(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to other sign-in options
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Email Authentication Button */}
          <button
            onClick={() => setShowEmailAuth(true)}
            className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 border border-gray-300"
            type="button"
          >
            📧 Continue with Email
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Providers */}
          <GoogleSignInButton 
            onSignIn={onSignIn}
            className="w-full"
          />

          <AppleSignInButton 
            onSignIn={onSignIn}
            className="w-full"
          />
        </div>
      )}

      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <p>
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}