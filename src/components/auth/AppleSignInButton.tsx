'use client'

interface AppleSignInButtonProps {
  onSignIn?: () => void
  className?: string
}

export function AppleSignInButton({ onSignIn, className = '' }: AppleSignInButtonProps) {
  const handleAppleSignIn = () => {
    onSignIn?.()
    // Apple Sign-In not yet implemented
    alert('Apple Sign-In coming soon!')
  }

  return (
    <button
      onClick={handleAppleSignIn}
      className={`flex items-center justify-center gap-3 px-6 py-4 bg-black hover:bg-gray-900 text-white font-sans font-medium text-lg rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      type="button"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <span>Continue with Apple</span>
    </button>
  )
}