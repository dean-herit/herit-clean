'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { 
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  LanguageIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface UserAvatarProps {
  className?: string
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
]

export function UserAvatar({ className = '' }: UserAvatarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    // TODO: Implement language change logic
    localStorage.setItem('language', langCode)
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'U'
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800/50 transition-colors">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
          {getInitials()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-100">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.email || 'User'
            }
          </p>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-lg bg-gray-800 shadow-lg ring-1 ring-black/20 focus:outline-none">
          <div className="p-1">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-gray-700">
              <p className="text-sm font-medium text-gray-100">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : 'User'
                }
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>

            {/* Language Selector */}
            <div className="py-1 border-b border-gray-700">
              <div className="px-3 py-1">
                <p className="text-xs text-gray-400 mb-1">Language</p>
                {languages.map((lang) => (
                  <Menu.Item key={lang.code}>
                    {({ active }) => (
                      <button
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`${
                          active ? 'bg-gray-700' : ''
                        } ${
                          selectedLanguage === lang.code ? 'bg-gray-700/50' : ''
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-100`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                        {selectedLanguage === lang.code && (
                          <span className="ml-auto text-blue-400">✓</span>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push('/profile')}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-100`}
                  >
                    <UserIcon className="mr-3 h-4 w-4 text-gray-400" />
                    Your Profile
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push('/settings')}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-100`}
                  >
                    <Cog6ToothIcon className="mr-3 h-4 w-4 text-gray-400" />
                    Settings
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Logout */}
            <div className="py-1 border-t border-gray-700">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={`${
                      active ? 'bg-gray-700' : ''
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm text-red-400`}
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}