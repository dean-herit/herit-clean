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

      {/* Error Display */}
      {authError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{authError}</p>
        </div>
      )}

      {/* Email Authentication Forms */}
      {showEmailAuth ? (
        <div className="space-y-6">
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                authMode === 'login'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-white/60 hover:text-white/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
                authMode === 'signup'
                  ? 'border-brand-500 text-brand-400'
                  : 'border-transparent text-white/60 hover:text-white/80'
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
              className="text-sm text-white/60 hover:text-white/80 underline font-medium transition-colors"
            >
              ← Back to other sign-in options
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Authentication Button */}
          <button
            onClick={() => setShowEmailAuth(true)}
            className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30"
            type="button"
          >
            📧 Continue with Email
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/60 font-medium">
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

      <div className="text-center text-xs text-white/50">
        <p>
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-brand-400 hover:text-brand-300 underline font-medium">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-brand-400 hover:text-brand-300 underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}