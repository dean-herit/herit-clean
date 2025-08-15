'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  SunIcon, 
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { UserAvatar } from './UserAvatar'
import { useTheme } from '@/providers/ThemeProvider'
import { useAuth } from '@/hooks/useAuth'

interface UnifiedHeaderProps {
  showNavigation?: boolean
  className?: string
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Assets', href: '/assets', icon: BuildingOfficeIcon },
  { name: 'Beneficiaries', href: '/beneficiaries', icon: UsersIcon },
  { name: 'Will Creation', href: '/will', icon: DocumentTextIcon },
]

export function UnifiedHeader({ showNavigation = true, className = '' }: UnifiedHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <header className={`sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href={isAuthenticated ? '/dashboard' : '/'} 
              className="text-2xl font-light tracking-wide text-white hover:opacity-80 transition-opacity"
            >
              Herit
            </Link>
          </div>

          {/* Desktop Navigation */}
          {showNavigation && isAuthenticated && (
            <nav className="hidden md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* Right side items */}
          <div className="flex items-center gap-3">
            {/* Production Environment Banner */}
            {process.env.NODE_ENV === 'production' && (
              <div className="hidden md:flex items-center bg-green-600 text-white px-3 py-1 rounded-md text-xs font-medium">
                PRODUCTION
              </div>
            )}
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              )}
            </button>

            {/* Notifications (if authenticated) */}
            {isAuthenticated && (
              <button
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <BellIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              </button>
            )}

            {/* User Avatar (if authenticated) */}
            {isAuthenticated && <UserAvatar />}

            {/* Mobile menu button */}
            {showNavigation && isAuthenticated && (
              <button
                type="button"
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                ) : (
                  <Bars3Icon className="h-6 w-6 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && showNavigation && isAuthenticated && (
          <nav className="md:hidden py-2 border-t border-gray-800">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}