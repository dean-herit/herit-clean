'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'midnight' | 'slate' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme rotation order
const THEME_ORDER: Theme[] = ['dark', 'midnight', 'slate']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get theme from localStorage or default based on system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null
    let initialTheme: Theme = 'dark'
    
    if (savedTheme && THEME_ORDER.includes(savedTheme)) {
      initialTheme = savedTheme
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initialTheme = prefersDark ? 'dark' : 'light'
    }
    
    setTheme(initialTheme)
    applyTheme(initialTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('dark')
    
    // Set data-theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Keep dark class for legacy compatibility if not light theme
    if (newTheme !== 'light') {
      document.documentElement.classList.add('dark')
    }
  }

  const toggleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme)
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length
    const newTheme = THEME_ORDER[nextIndex]
    
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}