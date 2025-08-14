'use client'

import { useState } from 'react'
import Link from 'next/link'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link href="/" className="text-3xl font-brand font-bold text-white drop-shadow-lg hover:opacity-80 transition-opacity">
            Herit
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <a href="https://herit.com#express-interest" className="text-white/90 hover:text-white font-medium transition-colors">
              Express Interest
            </a>
            <a href="https://herit.com/privacy" className="text-white/90 hover:text-white font-medium transition-colors">
              Privacy Policy
            </a>
            <a href="https://herit.com/team" className="text-white/90 hover:text-white font-medium transition-colors">
              Our Team
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <nav className="px-2 pt-2 pb-6 space-y-1 bg-black/20 backdrop-blur-md rounded-lg border border-white/20">
              <a
                href="https://herit.com#express-interest"
                className="block px-3 py-2 text-white/90 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Express Interest
              </a>
              <a
                href="https://herit.com/privacy"
                className="block px-3 py-2 text-white/90 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy Policy
              </a>
              <a
                href="https://herit.com/team"
                className="block px-3 py-2 text-white/90 hover:text-white font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Our Team
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}